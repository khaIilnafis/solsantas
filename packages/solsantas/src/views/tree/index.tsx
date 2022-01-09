/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import {
	Container,
	Grid,
	Box,
	ImageList,
	ImageListItem,
	ImageListItemBar,
	IconButton,
	LinearProgress,
	Typography
} from '@mui/material';
import * as anchor from '@project-serum/anchor';
import { Program, Provider } from '@project-serum/anchor';
import { AccountInfo, Commitment, PublicKey, Signer, Transaction, } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, SANTA_ESCROW_PROGRAM_ID } from '../../utils/ids'
import idl from '../../types/anchor_escrow.json';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { NFTGet } from "../../utils/nft-get"
import { INFTParams, INFT } from "../../common/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSleigh } from "@fortawesome/free-solid-svg-icons";
import ExchangeModal from '../../components/ExchangeModal'
import {
	getAtaForMint,
	getNetworkExpire,
	getNetworkToken,
	createAssociatedTokenAccountInstruction,
} from '../../utils/utils';
import { sendTransactions, sendSignedTransaction } from '../../utils/connection';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import holders from "../../utils/matched.json";
import { parse } from 'node:path/win32';

const updateAuthority = setAuthority()
//Todo add the authority public keys for each network
function setAuthority() {
	switch (process.env.REACT_APP_SOLANA_NETWORK!) {
		case 'mainnet-beta':
			return 'DaSCsY4SLWRDDmJdv84d9AShCCyu8E1ffgMGGHnP6Yry'
		case 'devnet':
			return 'ARJAHAsDVtK242pmBZiJmXSmwM24BMrJfVZBphw6HjMf'
		case 'local':
			return ''
	}
}
const opts = {
	preflightCommitment: "processed"
}
export default function TreeView() {
	const { connection } = useConnection()
	const { publicKey, sendTransaction, signTransaction, } = useWallet();
	const wallet = useWallet();
	const [open, setOpen] = useState(false)
	const [nft, setNFT] = useState<INFT>()
	const [isInitializer, setIsInitiliazer] = useState(false)
	const [allEscrowAccounts, setAllEscrowAccounts] = useState<any>();
	const [escrowNFT, setEscrowNFT] = useState<INFT>();
	const [allFetchedNFTs, setAllFetchedNFTs] = useState<INFT[]>(); // this is everything fetched in mem
	const [activeEscrow, setActiveEscrow] = useState<any>();
	// @ts-ignore
	const provider = new Provider(connection, wallet, opts.preflightCommitment);

	anchor.setProvider(provider);

	const programID = new PublicKey(idl.metadata.address);

	const program = new Program(idl as anchor.Idl, programID, provider);

	const handleOpen = () => {
		setOpen(true);
	}
	const handleClose = () => {
		setOpen(false);
	}
	const getEscrowNft = async (currEscrow: any) => {
		if (!currEscrow) return;
		let accountInfo = await connection.getParsedAccountInfo(currEscrow.initializerDepositTokenAccount);
		//@ts-ignore
		if (accountInfo.value?.data.parsed.info.tokenAmount.uiAmount === 0) {
			try {
				//@ts-ignore
				const nft = await NFTGet({ mint: new PublicKey(accountInfo.value?.data.parsed.info.mint) }, connection);
				return nft
			} catch (e) {
				console.log(`Error ${e}`)
			}
		}
	}
	//initialize exchange accounts
	const initializeExchange = async (nft: INFT) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;
		let escrow_account_pda = null;

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(nft.address?.toBase58().slice(0, 5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${nft.address?.toBase58().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;
		const escrowAccount = anchor.web3.Keypair.fromSeed(bs58.decode(nft.address?.toString() as string));

		// @ts-ignore
		const mint = anchor.web3.Keypair.generate();
		const userTokenAccountAddress = (
			await getAtaForMint(mint.publicKey, publicKey)
		)[0];
		// console.log(`user Token account address:${userTokenAccountAddress}`);
		const signers: anchor.web3.Keypair[] = [mint];
		const instructions = [
			anchor.web3.SystemProgram.createAccount({
				fromPubkey: publicKey,
				newAccountPubkey: mint.publicKey,
				space: MintLayout.span,
				lamports:
					await provider.connection.getMinimumBalanceForRentExemption(
						MintLayout.span,
					),
				programId: TOKEN_PROGRAM_ID,
			}),
			Token.createInitMintInstruction(
				TOKEN_PROGRAM_ID,
				mint.publicKey,
				0,
				publicKey,
				publicKey,
			),
			createAssociatedTokenAccountInstruction(
				userTokenAccountAddress,
				publicKey,
				publicKey,
				mint.publicKey,
			),
			Token.createMintToInstruction(
				TOKEN_PROGRAM_ID,
				mint.publicKey,
				userTokenAccountAddress,
				publicKey,
				[],
				1,
			),
		]
		try {
			const txs = await sendTransactions(connection, wallet, [instructions], [signers, []]);
		} catch (e) {
			console.log(`Error: ${e}`)
		}

		let initTx = program.transaction.initialize(
			vault_account_bump,
			new anchor.BN(1),
			new anchor.BN(1),
			{
				accounts: {
					initializer: publicKey,
					vaultAccount: vault_account_pda,
					mint: nft.mint,
					initializerDepositTokenAccount: nft.address,
					initializerReceiveTokenAccount: userTokenAccountAddress,
					escrowAccount: escrowAccount.publicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
					rent: anchor.web3.SYSVAR_RENT_PUBKEY,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
				instructions: [
					await program.account.escrowAccount.createInstruction(escrowAccount),
				],
			}
		);

		initTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		initTx.feePayer = publicKey;
		// @ts-ignore
		await wallet.signTransaction(initTx)
		await initTx.partialSign(escrowAccount)

		let signature = await sendSignedTransaction({ signedTransaction: initTx, connection: connection })
		let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
	}
	const exchange = async (nft: INFT) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;
		const depositATA =(await getAtaForMint(nft.mint, publicKey as PublicKey))[0]
		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(depositATA.toBase58().slice(0, 5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${depositATA.toBase58().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;

		const mint = anchor.web3.Keypair.generate();
		const userTokenAccountAddress = (
			await getAtaForMint(mint.publicKey, publicKey as PublicKey)
		)[0];

		//@TODO - address of escrow account needs to be the publickey that is not this user
		// const escrowAccount = anchor.web3.Keypair.fromSecretKey(bs58.decode(wallet.publicKey?.toString() as string));

		let _escrowAccount = await program.account.escrowAccount.fetch(
			activeEscrow
		);

		const exchangeTx = await program.transaction.exchange({
			accounts: {
				taker: publicKey,
				takerDepositTokenAccount: nft.address,
				takerReceiveTokenAccount: userTokenAccountAddress,
				initializerDepositTokenAccount: depositATA,
				initializerReceiveTokenAccount: _escrowAccount.initializerReceiveTokenAccount,
				initializer: _escrowAccount.initializerKey,
				escrowAccount: _escrowAccount.publicKey,
				vaultAccount: vault_account_pda,
				vaultAuthority: vault_authority_pda,
				tokenProgram: TOKEN_PROGRAM_ID
			},
			// signers: [publicKey]
		});
		console.log(exchangeTx);
		exchangeTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		exchangeTx.feePayer = publicKey;
		try {
			if (!exchangeTx || !wallet.signTransaction) return;
			let signedTx = await wallet.signTransaction(exchangeTx);
			console.log(signedTx);
			console.log(`Signature verification: ${exchangeTx.verifySignatures()}`)

			let signature = await sendSignedTransaction({ signedTransaction: exchangeTx, connection: connection });
			console.log(signature)
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
			console.log(confirmation)
		} catch (e) {
			console.log(e)
		}
	}
	const cancelExchange = async (nft: INFT, currentEscrow: any) => {
		console.log(nft.address.toBase58())
		console.log(nft);
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;
		const depositATA =(await getAtaForMint(nft.mint, publicKey as PublicKey))[0]
		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(depositATA.toBase58().slice(0, 5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${depositATA.toBase58().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;
		console.log(currentEscrow.initializerDepositTokenAccount.toString());
		let _escrowAccount = await program.account.escrowAccount.fetch(
			currentEscrow.pubkey
		);
		console.log(`Values from fetch:`);
		console.log(`_escrowAccount.initializerKey ${_escrowAccount.initializerKey.toString()}`);
		console.log(`_escrowAccount.initializerDepositTokenAccount ${_escrowAccount.initializerDepositTokenAccount.toString()}`)
		console.log(`_escrowAccount.initializerReceiveTokenAccount ${_escrowAccount.initializerReceiveTokenAccount.toString()}`)
		console.log(_escrowAccount)
		console.log(`Values for tx: `)
		console.log(`publicKey ${publicKey}`)
		console.log(` initializerDepositTokenAccount ${activeEscrow.initializerDepositTokenAccount}`)
		console.log(`vault_account_pda ${vault_account_pda}`)
		console.log(`vault_authority_pda ${vault_authority_pda}`)
		console.log(`currentEscrow.pubkey ${currentEscrow.pubkey}`)
		console.log(`${TOKEN_PROGRAM_ID}`)
		console.log(`nft.address ${nft.address}`)
		
		console.log(`Deposit ATA ${depositATA}`)
		const cancelTx = await program.transaction.cancel(
			{
				accounts: {
					initializer: publicKey,
					initializerDepositTokenAccount: depositATA,
					vaultAccount: vault_account_pda,
					vaultAuthority: vault_authority_pda,
					escrowAccount: currentEscrow.pubkey,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		);
		console.log(cancelTx);
		cancelTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		cancelTx.feePayer = publicKey;
		try {
			if (!cancelTx || !wallet.signTransaction) return;
			let signedTx = await wallet.signTransaction(cancelTx);
			console.log(signedTx);
			console.log(`Signature verification: ${cancelTx.verifySignatures()}`)

			let signature = await sendSignedTransaction({ signedTransaction: cancelTx, connection: connection });
			console.log(signature)
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
			console.log(confirmation)
		} catch (e) {
			console.log(e)
		}


	}
	const fetchNFTs = async (params: INFTParams) => {
		const fetchedNfts = await NFTGet(params, connection);
		if (fetchedNfts.length) {
			setAllFetchedNFTs(fetchedNfts.filter((nft) => {
				return nft.metadataOnchain.updateAuthority !== updateAuthority
			}))
		} else {

		}
	};
	const getUserMatches = async (nft: INFT) => {
		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(nft.address?.toBase58().slice(0, 5) as string))],
			programID
		);

		console.log(`Vault Account: ${_vault_account_pda.toBase58()}`);
		const matchPair = holders.filter((matchGrp) => {
			return matchGrp.matchA === wallet.publicKey?.toString() || matchGrp.matchB === wallet.publicKey?.toString()
		})
		const matchesList: string[] = [];
		matchPair.forEach((pair) => {
			if (pair.matchA === wallet.publicKey?.toString()) {
				matchesList.push(pair.matchB);
			} else if (pair.matchB === wallet.publicKey?.toString()) {
				matchesList.push(pair.matchA);
			}
		})
		return matchesList
	}
	const getAllEscrowAccounts = async () => {
		return await connection.getProgramAccounts(SANTA_ESCROW_PROGRAM_ID);
	}
	const getEscrowAccount = async (accounts: any) => {
		if (!publicKey) return;
		let escrowAccount;

		const filteredAccounts = new Promise<void>((resolve: any, reject) => {
			accounts.filter(async (account: any) => {
				let matchesList
				try {
					const parsedAccount = await program.account.escrowAccount.fetch(account.pubkey as PublicKey);
					// console.log(`${parsedAccount.initializerKey.toString() === wallet.publicKey?.toString()} Escrow Init: ${parsedAccount.initializerKey.toString()} curr Wallet: ${wallet.publicKey?.toString()}`)
					if (parsedAccount.initializerKey.toString() === wallet.publicKey?.toString()) {
						// console.log(parsedAccount)
						// setIsInitiliazer(true);
						Object.assign(parsedAccount, account);
						resolve(parsedAccount);
						// await setActiveEscrow(parsedAccount)
					} else {
						let nft = await getEscrowNft(parsedAccount);
						// console.log(`NFT for parsed account: ${parsedAccount.initializerKey.toString()}`)
						// console.log(nft)
						if (!nft === undefined || nft?.length === 0){ 
							return reject();
						}
						else {
							//@ts-ignore
							matchesList = await getUserMatches(nft[0])
							if (matchesList.indexOf(account.pubkey.toString()) !== -1) {
								Object.assign(parsedAccount, account)
								resolve(parsedAccount);
								// await setActiveEscrow(parsedAccount)
							}
						}
					}
				} catch (e) {
					// console.log(`Could not parse for: ${account.pubkey.toString()} because ${e}`)
					// console.log(account);
				}
			})
		})
		filteredAccounts.then((parsedAccount:any)=>{
			console.log(parsedAccount.initializerKey.toString())
			setIsInitiliazer(true);
			setActiveEscrow(parsedAccount)
		})
	}
	useEffect(() => {
		if (!activeEscrow) return;
		console.log(` Active Escrow Pubkey: ${activeEscrow.pubkey.toString()}`)
		console.log(activeEscrow)
		console.log(`${activeEscrow.initializerKey.toString()}`);
		console.log(`${activeEscrow.initializerDepositTokenAccount.toString()}`)
		console.log(`${activeEscrow.initializerReceiveTokenAccount.toString()}`)
		const NFT = getEscrowNft(activeEscrow)
		NFT.then((res) => {
			if (res) setEscrowNFT(res[0])
		});

	}, [activeEscrow])
	useEffect(() => {
		if (!publicKey) {
			return
		} else {
			setAllFetchedNFTs(JSON.parse(localStorage.getItem(`${wallet.publicKey}`) as string))
			if (!allFetchedNFTs) {
				fetchNFTs({ owner: publicKey })
			}
			(async () => {
				const escrowAccounts = await getAllEscrowAccounts();
				console.log(`There are a total of: ${escrowAccounts.length} escrow accounts`);
				escrowAccounts.forEach((account) => console.log(account.pubkey.toString()))
				const escrowAccount = await getEscrowAccount(escrowAccounts);
				console.log(`Escrow Account Found: ${escrowAccount}`)
				const nft = await getEscrowNft(escrowAccount);
				console.log(nft)
				if (!nft) return;
				setEscrowNFT(nft[0])
			})()
		}
	}, [publicKey])
	return (
		<Container>
			<Grid container justifyContent="center">
				{escrowNFT ? (
					<Grid item justifyContent="center">
						<Typography variant='h3' sx={{ textAlign: "center" }}>Your current exchange: </Typography>
						<a href="#" style={{ textDecoration: 'none' }} onClick={() => { handleOpen(); setNFT(escrowNFT) }} key={escrowNFT.metadataOnchain.mint}>
							<img height="200px"
								width="200px"
								src={`${escrowNFT.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
								srcSet={`${escrowNFT.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}>
							</img>
						</a>
					</Grid>
				) : ('')}
				{allFetchedNFTs ?
					<ImageList sx={{ width: 'auto', height: 'auto' }} cols={4}>
						{allFetchedNFTs.map((nft) => (
							<a href="#" style={{ textDecoration: 'none' }} onClick={() => { handleOpen(); setNFT(nft) }} key={nft.metadataOnchain.mint}>
								<ImageListItem key={nft.metadataOnchain.mint}>
									<img
										height="75px"
										width="75px"
										src={`${nft.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
										srcSet={`${nft.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
										alt={nft.metadataOnchain.data.name}
										loading="lazy"
									/>
									<ImageListItemBar
										title={nft.metadataExternal.name}
										position="below"
										actionIcon={
											<IconButton
												sx={{ color: 'white' }}
												aria-label={`sleigh ${nft.metadataExternal.name}`}
											>
												<FontAwesomeIcon icon={faSleigh}></FontAwesomeIcon>
											</IconButton>
										}
										actionPosition="right">
									</ImageListItemBar>
								</ImageListItem>
							</a>
						))}
					</ImageList>
					:
					<Box sx={{ width: '100%', height: '900px' }}>
						{wallet.connected ? (
							<div>
								<Typography variant='h3' sx={{ textAlign: "center" }}>Fetching NFTS</Typography>
								<LinearProgress></LinearProgress>
							</div>
						) :
							<div>
								<Typography variant='h3' sx={{ textAlign: "center" }}>Connect Wallet</Typography>
							</div>}
					</Box>
				}
			</Grid>
			<ExchangeModal open={open} setOpen={setOpen} handleOpen={handleOpen} handleClose={handleClose} nft={nft} initTx={initializeExchange} cancelTx={cancelExchange} exchangeTx={exchange} isInitializer={isInitializer} activeEscrow={activeEscrow}></ExchangeModal>
		</Container >)
}
