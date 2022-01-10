/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
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
import { Token, TOKEN_PROGRAM_ID, MintLayout, u64 } from "@solana/spl-token";
import { deserializeTokenAccount, deserializeTokenMint } from '../../common/spl-token';
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
import holders from "../../utils/matched_dev.json";
import { IdlTypeDef } from '@project-serum/anchor/dist/cjs/idl';
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';

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
interface ParsedEscrowAccount {
	initializerKey: PublicKey,
	initializerDepositTokenAccount: PublicKey,
	initializerReceiveTokenAccount: PublicKey,
	initializerAmount: u64,
	takerAmount: u64,
}
interface EscrowAccount {
	account: Object,
	pubkey: PublicKey
}
export default function TreeView() {
	const { connection } = useConnection()
	const { publicKey, sendTransaction, signTransaction, } = useWallet();
	const wallet = useWallet();
	const [open, setOpen] = useState(false)
	const [nft, setNFT] = useState<INFT>()
	const [isInitializer, setIsInitiliazer] = useState(false)
	const [allEscrowAccounts, setAllEscrowAccounts] = useState<any[]>([]);
	const [escrowNFTs, setEscrowNFTs] = useState<INFT[]>([]);
	const [allFetchedNFTs, setAllFetchedNFTs] = useState<INFT[]>();
	const [activeEscrow, setActiveEscrow] = useState<any>();
	// @ts-ignore
	const provider = new Provider(connection, wallet, opts.preflightCommitment);

	anchor.setProvider(provider);

	const programID = new PublicKey(idl.metadata.address);

	const program = new Program(idl as anchor.Idl, programID, provider);

	const handleOpen = (nft: INFT) => {
		if (!nft) return;
		(async () => {
			const depositTokenAddress = (
				await getAtaForMint(nft.mint, publicKey as PublicKey)
			)[0];
			console.log(depositTokenAddress.toString())
			const escrow = await getActiveEscrow(depositTokenAddress.toString());
			console.log(escrow)
			if (escrow) {
				setActiveEscrow(escrow);
				if (escrow && escrow.initializerKey.toString() === wallet.publicKey) {
					setIsInitiliazer(true)
				}
			}
			setOpen(true);
		})()
	}
	const getActiveEscrow = async (depositAta: any) => {
		if (!allEscrowAccounts) return;
		const filteredAccounts = allEscrowAccounts.filter(async (account) => {
			const depositAccount = await getDespositAccount(account.initializerDepositTokenAccount)
				.then((account) => {
					console.log(account)
					return account
				})
			return depositAccount === account.initializerDepositTokenAccount.toString()
		});
		return filteredAccounts[0]
	}
	const getDespositAccount = async (depositToken: PublicKey) => {
		const lastTxSig = await connection.getConfirmedSignaturesForAddress2(depositToken, { limit: 1 });
		const lastTx = await connection.getTransaction(lastTxSig[0].signature.toString());

		//TODO - maybe don't hard code the account index here, but its always going to be the same for now. 
		return lastTx?.transaction.message.accountKeys[3].toString()
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
				//console.log(`Error ${e}`)
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
		// //console.log(`user Token account address:${userTokenAccountAddress}`);
		// const signers: anchor.web3.Keypair[] = [mint];
		const tx = new Transaction();
		tx.add(
			anchor.web3.SystemProgram.createAccount({
				fromPubkey: publicKey,
				newAccountPubkey: mint.publicKey,
				space: MintLayout.span,
				lamports:
					await provider.connection.getMinimumBalanceForRentExemption(
						MintLayout.span,
					),
				programId: TOKEN_PROGRAM_ID,
			})).add(
				Token.createInitMintInstruction(
					TOKEN_PROGRAM_ID,
					mint.publicKey,
					0,
					publicKey,
					publicKey,
				)
			).add(
				createAssociatedTokenAccountInstruction(
					userTokenAccountAddress,
					publicKey,
					publicKey,
					mint.publicKey,
				)
			).add(
				Token.createMintToInstruction(
					TOKEN_PROGRAM_ID,
					mint.publicKey,
					userTokenAccountAddress,
					publicKey,
					[],
					1,
				)
			)
		tx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		tx.feePayer = publicKey;
		// try {
		// 	// const txs = await sendTransactions(connection, wallet, [instructions], [signers, []]);
		// 	await sendSignedTransaction({signedTransaction:tx, connection})
		// } catch (e) {
		// 	//console.log(`Error: ${e}`)
		// }

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
		try {
			// @ts-ignore
			await wallet.signAllTransactions([tx, initTx])
			await tx.partialSign(mint)
			await initTx.partialSign(escrowAccount)
			let txSignature = await sendSignedTransaction({ signedTransaction: tx, connection: connection })
			let signature = await sendSignedTransaction({ signedTransaction: initTx, connection: connection })
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
		} catch (e) {
			console.log(`oops ${e}`)
		}
	}
	const exchange = async (toSendNt: INFT, currentEscrow: any, nft: INFT) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;
		console.log(`NFT Mint: ${nft.mint.toString()}`);
		const depositATA = (await getAtaForMint(nft.mint, currentEscrow.initializerKey))[0]
		console.log(depositATA.toString());
		console.log(depositATA.toBase58());
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

		const tx = new Transaction();
		tx.add(
			anchor.web3.SystemProgram.createAccount({
				fromPubkey: publicKey,
				newAccountPubkey: mint.publicKey,
				space: MintLayout.span,
				lamports:
					await provider.connection.getMinimumBalanceForRentExemption(
						MintLayout.span,
					),
				programId: TOKEN_PROGRAM_ID,
			})).add(
				Token.createInitMintInstruction(
					TOKEN_PROGRAM_ID,
					mint.publicKey,
					0,
					publicKey,
					publicKey,
				)
			).add(
				createAssociatedTokenAccountInstruction(
					userTokenAccountAddress,
					publicKey,
					publicKey,
					mint.publicKey,
				)
			).add(
				Token.createMintToInstruction(
					TOKEN_PROGRAM_ID,
					mint.publicKey,
					userTokenAccountAddress,
					publicKey,
					[],
					1,
				)
			)
		tx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		tx.feePayer = publicKey;

		const exchangeTx = await program.transaction.exchange({
			accounts: {
				taker: publicKey,
				takerDepositTokenAccount: toSendNt.address,
				takerReceiveTokenAccount: userTokenAccountAddress,
				initializerDepositTokenAccount: depositATA,
				initializerReceiveTokenAccount: currentEscrow.initializerReceiveTokenAccount,
				initializer: currentEscrow.initializerKey,
				escrowAccount: currentEscrow.pubkey,
				vaultAccount: vault_account_pda,
				vaultAuthority: vault_authority_pda,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
			},
			// signers: [publicKey]
		});
		//console.log(exchangeTx);
		exchangeTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		exchangeTx.feePayer = publicKey;
		try {
			//@ts-ignore
			await wallet.signAllTransactions([tx, exchangeTx])
			await tx.partialSign(mint)
			// await exchangeTx.partialSign(escrowAccount)
			let txSignature = await sendSignedTransaction({ signedTransaction: tx, connection: connection })
			let signature = await sendSignedTransaction({ signedTransaction: exchangeTx, connection: connection })
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
		}catch(e){
			console.log(`oops ${e}`)
		}	
		
	}
	const cancelExchange = async (nft: INFT, currentEscrow: any) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;
		console.log(`NFT Mint: ${nft.mint.toString()}`);
		const depositATA = (await getAtaForMint(nft.mint, publicKey as PublicKey))[0]
		console.log(depositATA.toString());
		console.log(depositATA.toBase58());
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
		//console.log(currentEscrow.initializerDepositTokenAccount.toString());
		// let _escrowAccount = await program.account.escrowAccount.fetch(
		// 	currentEscrow.pubkey
		// );

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
		//console.log(cancelTx);
		cancelTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		cancelTx.feePayer = publicKey;
		try {
			if (!cancelTx || !wallet.signTransaction) return;
			let signedTx = await wallet.signTransaction(cancelTx);
			//console.log(signedTx);
			//console.log(`Signature verification: ${cancelTx.verifySignatures()}`)

			let signature = await sendSignedTransaction({ signedTransaction: cancelTx, connection: connection });
			//console.log(signature)
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
			//console.log(confirmation)
		} catch (e) {
			//console.log(e)
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
	const getUserMatches = async (depositAta: PublicKey, escrowAccountInitializer: String) => {
		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(depositAta.toBase58().slice(0, 5) as string))],
			programID
		);
		const matchPair = holders.filter((matchGrp) => {
			return matchGrp.matchA === wallet.publicKey?.toString() || matchGrp.matchB === wallet.publicKey?.toString()
		})
		const matchesList: string[] = [];
		matchPair.forEach((pair) => {
			if (pair.matchA === escrowAccountInitializer) {
				// console.log('Matched A!')
				matchesList.push(pair.matchB);
			} else if (pair.matchB === escrowAccountInitializer) {
				// console.log('Matched B!')
				matchesList.push(pair.matchA);
			}
		})
		return matchesList
	}
	const getAllEscrowAccounts = async () => {
		return await connection.getProgramAccounts(SANTA_ESCROW_PROGRAM_ID);
	}
	const getActiveEscrowAccounts = async (accounts: any) => {
		if (!publicKey) return;
		let escrowAccounts: TypeDef<IdlTypeDef, anchor.IdlTypes<anchor.Idl>>[] = [], matchesList;
		for await (const account of accounts) {
			// console.log(account)
			try {
				const parsedAccount = await program.account.escrowAccount.fetch(account.pubkey);
				matchesList = await getUserMatches(parsedAccount.initializerDepositTokenAccount, parsedAccount.initializerKey.toString());
				if (parsedAccount.initializerKey.toString() === wallet.publicKey || matchesList.length > 0) {
					parsedAccount.pubkey = account.pubkey;
					setAllEscrowAccounts([parsedAccount])
					// console.log(escrowAccounts)
				}
			} catch (e) {
				console.log(`oops ${e}`)
			}
		}
		return
	}
	useEffect(() => {
		allEscrowAccounts?.forEach(async (escrowAccount) => {
			const nft = await getEscrowNft(escrowAccount);
			if (!nft) return;
			//@ts-ignore
			await setEscrowNFTs(escrowNFTs => [...escrowNFTs.filter((nftEntry) => nftEntry.address.toString() !== nft[0].address.toString()), nft[0]])
		})
	}, [allEscrowAccounts])
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
				await getActiveEscrowAccounts(escrowAccounts);
			})()
		}
	}, [publicKey])
	return (
		<Container>
			<Grid container justifyContent="center">
				{escrowNFTs ? (
					<Grid container justifyContent="center" sx={{ marginBottom: 5 }}>
						<Typography variant='h3' sx={{ textAlign: "center", marginBottom: 5 }}>Your Gifts:</Typography>
						<Grid container justifyContent="center">
							<ImageList sx={{ width: 'auto', height: 'auto' }} cols={4}>
								{escrowNFTs.map((escrowNft, index) =>
								(
									<a href="#" style={{ textDecoration: 'none' }} onClick={() => { handleOpen(escrowNft); setNFT(escrowNft) }} key={escrowNft.metadataOnchain.mint}>
										<ImageListItem key={escrowNft.metadataOnchain.mint}>

											{//@ts-ignore
												(allFetchedNFTs?.filter((e) => escrowNFTs.indexOf(e) > -1))?.length > 0 ? (
													<img
														height="75px"
														width="75px"
														src={`${escrowNft.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
														srcSet={`${escrowNft.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
														alt={escrowNft.metadataOnchain.data.name}
														loading="lazy"
													/>) : (<img
														height="75px"
														width="75px"
														src={`/images/SSoS_Coin_GIF.gif`}
														loading="lazy"
													/>)}

											<ImageListItemBar
												title={`Gift #${index + 1}`}
												position="below"
												actionIcon={
													<IconButton
														sx={{ color: 'white' }}
														aria-label={`sleigh ${index}`}
													>
														<FontAwesomeIcon icon={faSleigh}></FontAwesomeIcon>
													</IconButton>
												}
												actionPosition="right">
											</ImageListItemBar>
										</ImageListItem>
									</a>
								)
								)}
							</ImageList>
						</Grid>
					</Grid>
				) : ('')}
				{allFetchedNFTs ?
					(
						<Grid item>
							<Typography variant='h3' sx={{ textAlign: "center", marginBottom: 5 }} >Select an NFT to give: </Typography>
							<ImageList sx={{ width: 'auto', height: 'auto' }} cols={4}>
								{allFetchedNFTs.map((nft) => (
									<a href="#" style={{ textDecoration: 'none' }} onClick={() => { handleOpen(nft); setNFT(nft) }} key={nft.metadataOnchain.mint}>
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
						</Grid>
					)
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
			<ExchangeModal open={open} setOpen={setOpen} handleOpen={handleOpen} handleClose={handleClose} nft={nft} initTx={initializeExchange} cancelTx={cancelExchange} exchangeTx={exchange} isInitializer={isInitializer} activeEscrow={activeEscrow} allFetchedNFTs={allFetchedNFTs}></ExchangeModal>
		</Container >)
}
