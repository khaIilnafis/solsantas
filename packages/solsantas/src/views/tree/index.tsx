/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect,useState } from 'react';
import {
	Container,
	Grid,
	Box,
	ImageList,
	ImageListItem,
	ImageListItemBar,
	IconButton,
	Typography,
	CircularProgress,
	Snackbar,
	Alert
} from '@mui/material';
import * as anchor from '@project-serum/anchor';
import { Program, Provider } from '@project-serum/anchor';
import { PublicKey, Transaction, } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SANTA_ESCROW_PROGRAM_ID } from '../../utils/ids'
import idl from '../../types/anchor_escrow.json';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { NFTGet } from "../../utils/nft-get"
import { INFTParams, INFT } from "../../common/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSleigh } from "@fortawesome/free-solid-svg-icons";
import ExchangeModal from '../../components/ExchangeModal'
import {
	createAssociatedTokenAccountInstruction,
	getAtaForMint,
} from '../../utils/utils';
import { sendSignedTransaction } from '../../utils/connection';
import holders from "../../utils/matched_dev.json";
import { IdlTypeDef } from '@project-serum/anchor/dist/cjs/idl';
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';
import { contextType } from 'react-fontawesome';
import { text } from '@fortawesome/fontawesome-svg-core';

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
	const { publicKey } = useWallet();
	const wallet = useWallet();
	const [open, setOpen] = useState(false)
	const [nft, setNFT] = useState<INFT>()
	const [isInitializer, setIsInitiliazer] = useState(false)
	const [allEscrowAccounts, setAllEscrowAccounts] = useState<any[]>([]);
	const [escrowNFTs, setEscrowNFTs] = useState<INFT[]>([]);
	const [allFetchedNFTs, setAllFetchedNFTs] = useState<INFT[]>();
	const [activeEscrow, setActiveEscrow] = useState<any>();
	const [fetching, setFetching] = useState<boolean>();
	// const [toastOpen, setToastOpen] = React.useState(false);
	// @ts-ignore
	const provider = new Provider(connection, wallet, opts.preflightCommitment);

	anchor.setProvider(provider);

	const programID = new PublicKey(idl.metadata.address);

	const program = new Program(idl as anchor.Idl, programID, provider);
	// const handleToastClick = () => {
	// 	setToastOpen(true);
	// };

	// const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
	// 	if (reason === 'clickaway') {
	// 		return;
	// 	}

	// 	setToastOpen(false);
	// };
	// const renderToast = () => {

	// }
	const handleOpen = (nft: INFT) => {
		if (!nft) return;
		(async () => {
			const depositTokenAddress = (
				await getAtaForMint(nft.mint, publicKey as PublicKey)
			)[0];
			//console.log(depositTokenAddress.toString())
			const escrow = await getActiveEscrow(depositTokenAddress.toString());
			//console.log(escrow)
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
					//console.log(account)
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
		//console.log(accountInfo);
		//@ts-ignore
		if (accountInfo.value?.data.parsed.info.tokenAmount.uiAmount === 0) {
			try {
				//@ts-ignore
				const nft = await NFTGet({ mint: new PublicKey(accountInfo.value?.data.parsed.info.mint) }, connection);
				console.log(nft[0].address.toString());
				console.log(nft[0].splTokenInfo?.owner.toString());
				return nft
			} catch (e) {
				////console.log(`Error ${e}`)
			}
		}
	}
	//initialize exchange accounts
	const initializeExchange = async (nft: INFT) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(nft.mint?.toBase58().slice(0, 5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${nft.mint?.toBase58().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;
		const escrowAccount = anchor.web3.Keypair.generate();

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
			await wallet.signAllTransactions([initTx])
			await initTx.partialSign(escrowAccount)
			try {
				let signature = await sendSignedTransaction({ signedTransaction: initTx, connection: connection });
				let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
				//console.log(confirmation)
			} catch (e) {
				//console.log(`oops ${e}`)
			}
		} catch (e) {
			//console.log(`oops ${e}`)
		}
	}
	const exchange = async (toSendNft: INFT, currentEscrow: any, nft: INFT) => {
		if (!publicKey) return;

		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;
		let taker_vault_account_pda = null;
		let taker_vault_account_bump = null;
		let taker_vault_authority_pda = null;

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(nft.mint?.toBase58().slice(0, 5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;
		console.log(`Initializer Vault Account PDA: ${vault_account_pda.toString()}`)
		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${nft.mint?.toBase58().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;

		const takerTokenAccountAddress = (
			await getAtaForMint(nft.mint, publicKey)
		)[0];

		let checkAtaExists = await connection.getParsedAccountInfo(takerTokenAccountAddress);

		if(checkAtaExists.value == null){
			let createTakerReceiveAtaTx = program.transaction.ata(
				{
					accounts: {
						token: takerTokenAccountAddress,
						mint: nft.mint,
						payer: publicKey,
						escrowAccount: currentEscrow.pubkey,
						rent: anchor.web3.SYSVAR_RENT_PUBKEY,
						systemProgram: anchor.web3.SystemProgram.programId,
						tokenProgram: TOKEN_PROGRAM_ID,
						associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
					},
				}
			);
	
			createTakerReceiveAtaTx.recentBlockhash = (
				await connection.getRecentBlockhash("max")
			).blockhash;
			createTakerReceiveAtaTx.feePayer = publicKey;
			try {
				//@ts-ignore
				await wallet.signAllTransactions([createTakerReceiveAtaTx])
				let txSignature = await sendSignedTransaction({ signedTransaction: createTakerReceiveAtaTx, connection: connection });
				let confirmation = await connection.confirmTransaction(txSignature.txid, 'processed');
				//console.log(confirmation);
			} catch (e) {
				//console.log(`oops ${e}`)
			}
		}

		const [_taker_vault_account_pda, _taker_vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(toSendNft.mint?.toBase58().slice(0, 5) as string))],
			programID
		);
		taker_vault_account_pda = _taker_vault_account_pda;
		taker_vault_account_bump = _taker_vault_account_bump;
		console.log(`Taker Vault PDA ${taker_vault_account_pda}`);
		const [_taker_vault_authority_pda, _taker_vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${toSendNft.mint?.toBase58().slice(0, 5)}`))],
			programID
		);
		taker_vault_authority_pda = _taker_vault_authority_pda;
		
		let _escrowAccount = await program.account.escrowAccount.fetch(
			currentEscrow.pubkey
		);
		// console.log(`Initializer ATA: ${associatedTokenAccount}`)
		
		const exchangeTx = await program.transaction.exchange(
			taker_vault_account_bump,
			{
				accounts: {
					taker: publicKey,
					takerDepositTokenAccount: toSendNft.address,
					takerReceiveTokenAccount: takerTokenAccountAddress,
					initializerDepositTokenAccount: nft.address,
					initializerReceiveTokenAccount: takerTokenAccountAddress,
					initializer: _escrowAccount.initializerKey,
					escrowAccount: currentEscrow.pubkey,
					vaultAccount: vault_account_pda,
					vaultAuthority: vault_authority_pda,
					takerVaultAccount: taker_vault_account_pda,
					mint: nft.mint,
					depositMint: toSendNft.mint,
					tokenProgram: TOKEN_PROGRAM_ID,
					systemProgram: anchor.web3.SystemProgram.programId,
					associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
					rent: anchor.web3.SYSVAR_RENT_PUBKEY
				},
			});

		exchangeTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		exchangeTx.feePayer = publicKey;
		try {
			//@ts-ignore
			await wallet.signAllTransactions([exchangeTx])
			let txSignature = await sendSignedTransaction({ signedTransaction: exchangeTx, connection: connection })
			let confirmation = await connection.confirmTransaction(txSignature.txid, 'processed');
			//console.log(confirmation)
		} catch (e) {
			//console.log(`oops ${e}`)
		}

		let updatedEscrow = await program.account.escrowAccount.fetch(
			currentEscrow.pubkey
		);
		console.log(updatedEscrow);
		console.log(updatedEscrow.withdraw);
	}
	const cancelExchange = async (nft: INFT, currentEscrow: any) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(nft.mint?.toBase58().slice(0, 5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${nft.mint?.toBase58().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;

		const cancelTx = await program.transaction.cancel(
			{
				accounts: {
					initializer: publicKey,
					vaultAccount: vault_account_pda,
					vaultAuthority: vault_authority_pda,
					initializerDepositTokenAccount: currentEscrow.initializerDepositTokenAccount,
					escrowAccount: currentEscrow.pubkey,
					mint: nft.mint,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		);
		////console.log(cancelTx);
		cancelTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		cancelTx.feePayer = publicKey;
		try {
			if (!cancelTx || !wallet.signTransaction) return;
			let signedTx = await wallet.signTransaction(cancelTx);
			////console.log(signedTx);
			////console.log(`Signature verification: ${cancelTx.verifySignatures()}`)

			let signature = await sendSignedTransaction({ signedTransaction: cancelTx, connection: connection });
			////console.log(signature)
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
			////console.log(confirmation)
		} catch (e) {
			////console.log(e)
		}


	};
	const withdraw = async (nft: INFT, currentEscrow: any) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;
		// //console.log(`NFT Mint: ${nft.mint.toString()}`);
		// const depositATA = (await getAtaForMint(nft.mint, publicKey as PublicKey))[0]
		// //console.log(depositATA.toString());
		// //console.log(depositATA.toBase58());
		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)), Buffer.from(anchor.utils.bytes.utf8.encode(nft.mint?.toBase58().slice(0, 5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${nft.mint?.toBase58().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;

		const toTokenAccountAddress = (
			await getAtaForMint(nft.mint, publicKey)
		)[0];

		let createInitializerReceiveAtaTx = program.transaction.ata(
			{
				accounts: {
					token: toTokenAccountAddress,
					mint: nft.mint,
					payer: publicKey,
					escrowAccount: currentEscrow.pubkey,
					rent: anchor.web3.SYSVAR_RENT_PUBKEY,
					systemProgram: anchor.web3.SystemProgram.programId,
					tokenProgram: TOKEN_PROGRAM_ID,
					associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				},
			}
		);
		createInitializerReceiveAtaTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		createInitializerReceiveAtaTx.feePayer = publicKey;
		try {
			//@ts-ignore
			await wallet.signAllTransactions([createInitializerReceiveAtaTx])
			let txSignature = await sendSignedTransaction({ signedTransaction: createInitializerReceiveAtaTx, connection: connection });
			let confirmation = await connection.confirmTransaction(txSignature.txid, 'processed');
		} catch (e) {
			//console.log(`oops ${e}`)
		}
		////console.log(currentEscrow.initializerDepositTokenAccount.toString());

		let _escrowAccount = await program.account.escrowAccount.fetch(
			currentEscrow.pubkey
		);

		const withdrawTx = await program.transaction.withdraw(
			{
				accounts: {
					initializer: publicKey,
					initializerReceiveTokenAccount: _escrowAccount.initializerReceiveTokenAccount,
					mint: nft.mint,
					escrowAccount: currentEscrow.pubkey,
					vaultAccount: vault_account_pda,
					vaultAuthority: vault_authority_pda,
					rent: anchor.web3.SYSVAR_RENT_PUBKEY,
					systemProgram: anchor.web3.SystemProgram.programId,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		);
		////console.log(cancelTx);
		withdrawTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		withdrawTx.feePayer = publicKey;
		try {
			if (!withdrawTx || !wallet.signTransaction) return;
			let signedTx = await wallet.signTransaction(withdrawTx);

			let signature = await sendSignedTransaction({ signedTransaction: signedTx, connection: connection });

			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
			//console.log(confirmation)
		} catch (e) {
			//console.log(e)
		}


	}
	const fetchNFTs = async (params: INFTParams) => {
		try {
			const fetchedNfts = await NFTGet(params, connection);
			if (fetchedNfts.length) {
				setAllFetchedNFTs(fetchedNfts.filter((nft) => {
					return nft.metadataOnchain.updateAuthority !== updateAuthority
				}))
			} else {

			}
		} catch (e) {
			//console.log(`oops ${e}`);
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
				// //console.log('Matched A!')
				matchesList.push(pair.matchB);
			} else if (pair.matchB === escrowAccountInitializer) {
				// //console.log('Matched B!')
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
			// //console.log(account)
			try {
				const parsedAccount = await program.account.escrowAccount.fetch(account.pubkey);
				matchesList = await getUserMatches(parsedAccount.initializerDepositTokenAccount, parsedAccount.initializerKey.toString());
				if (parsedAccount.initializerKey.toString() === wallet.publicKey || matchesList.length > 0) {
					parsedAccount.pubkey = account.pubkey;
					setAllEscrowAccounts([parsedAccount])
					// //console.log(escrowAccounts)
					setFetching(false);
				}
			} catch (e) {
				setFetching(false);
				//console.log(`oops ${e}`)
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
				setFetching(true);
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

											{escrowNft.metadataOnchain.updateAuthority.toString() == wallet.publicKey?.toString() ? (
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
								{fetching ? (
									<div>
										<Typography variant='h3' sx={{ textAlign: "center" }}>Fetching NFTS</Typography>
										<Grid container justifyContent={'center'}>
											<CircularProgress />
										</Grid>
									</div>
								) : (
									<Typography variant='h3' sx={{ textAlign: "center" }}>No NFTs Found</Typography>
								)}
							</div>
						) :
							<div>
								<Typography variant='h3' sx={{ textAlign: "center" }}>Connect Wallet</Typography>
							</div>}
					</Box>
				}
			</Grid>
			<ExchangeModal open={open} setOpen={setOpen} handleOpen={handleOpen} handleClose={handleClose} nft={nft} initTx={initializeExchange} cancelTx={cancelExchange} exchangeTx={exchange} isInitializer={isInitializer} activeEscrow={activeEscrow} allFetchedNFTs={allFetchedNFTs}></ExchangeModal>
			{/* <Snackbar open={open} autoHideDuration={6000} onClose={handleToastClose}>
				<Alert onClose={handleToastClose} severity="error" sx={{ width: '100%' }}>
					Please select an NFT!
				</Alert>
			</Snackbar> */}
		</Container >)
}
