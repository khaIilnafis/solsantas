/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
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
	Alert,
	AlertColor,
	Card,
	CardMedia,
	CardContent,
	CardActionArea
} from '@mui/material';
import * as anchor from '@project-serum/anchor';
import { Program, Provider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from '../../types/anchor_escrow.json';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { NFTGet } from "../../utils/nft-get"
import { INFTParams, INFT } from "../../common/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSleigh } from "@fortawesome/free-solid-svg-icons";
import ExchangeModal from '../../components/ExchangeModal'
import {
	getAtaForMint,
} from '../../utils/utils';
import { sendSignedTransaction } from '../../utils/connection';
// import holders from "../../utils/matched.json";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../../utils';
interface EscrowAccount {
	pubkey: String;
	initializerKey: PublicKey,
	takerKey: PublicKey,
	initializerDepositMint: PublicKey,
	initializerDepositTokenAccount: PublicKey,
	takerDepositTokenAccount: PublicKey,
	initializerAmount: Number,
	state: Number,
	takerAmount: Number,
}
let holders:any;
if(process.env.REACT_APP_SOLANA_NETWORK! === 'devnet'){
	holders = require('../../utils/matched_dev.json')
}else{
	holders = require('../../utils/matched.json')
}
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
	const [nft, setNFT] = useState<INFT | undefined>()
	const [isInitializer, setIsInitiliazer] = useState(false);
	const [allEscrowAccounts, setAllEscrowAccounts] = useState<Array<any>>([]);
	const [escrowNFTs, setEscrowNFTs] = useState<INFT[] | undefined>([]);
	const [allFetchedNFTs, setAllFetchedNFTs] = useState<INFT[]>();
	const [activeEscrow, setActiveEscrow] = useState<any>();
	const [fetching, setFetching] = useState<boolean>();
	const [fetchingEscrowNFTs, setFetchingEscrowNFTs] = useState<boolean>();
	const [toastOpen, setToastOpen] = useState(false);
	const [severity, setSeverity] = useState<AlertColor>();
	const [alertMessage, setAlertMessage] = useState<String>();
	const [initialized, setInitialized] = useState<boolean>();
	const [canceled, setCanceled] = useState<boolean>();
	const [exchanged, setExchanged] = useState<boolean>();
	// @ts-ignore
	const provider = new Provider(connection, wallet, opts.preflightCommitment);

	anchor.setProvider(provider);

	const programID = new PublicKey(idl.metadata.address);

	const program = new Program(idl as anchor.Idl, programID, provider);
	const showAlert = async (event: any, message: String) => {
		if (event === 'error') {
			await setSeverity('error');
			await setAlertMessage(message);

		} else if (event === 'success') {
			await setSeverity('success');
			await setAlertMessage(message);
		}
		setToastOpen(true);
	}
	const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setToastOpen(false);
	};
	const handleOpen = (nftParam: INFT) => {
		if (!nftParam) return;
		setActiveEscrow(undefined);
		setNFT(undefined);
		(async () => {
			let depositTokenAddress;
			if (nftParam.splTokenInfo?.owner.toString() === publicKey?.toString() || nftParam.lastOwner === publicKey?.toString()) {
				depositTokenAddress = (
					await getAtaForMint(nftParam.mint, publicKey as PublicKey)
				)[0];
			} else {
				// console.log(nftParam.metadataOnchain.updateAuthority)
				depositTokenAddress = (
					await getAtaForMint(nftParam.mint, new PublicKey(nftParam.metadataOnchain.updateAuthority))
				)[0];
			}
			const escrow = await getActiveEscrow(depositTokenAddress.toString(), nftParam);
			if (escrow) {
				setActiveEscrow(escrow);
				setOpen(true);
			} else {
				setOpen(true);
			}

		})()
	}
	const getActiveEscrow = async (depositAta: String, nftParam: INFT) => {
		await setActiveEscrow(undefined)
		if (!allEscrowAccounts) return;
		let escrowAccounts = allEscrowAccounts;
		const filteredAccounts = await escrowAccounts.filter((account) => {
			return depositAta === account.initializerDepositTokenAccount.toString() || nftParam.mint.toString() === account.initializerDepositMint.toString();
		});
		return filteredAccounts[0]
	}
	const getDespositAccount = async (depositToken: PublicKey) => {
		const lastTxSig = await connection.getConfirmedSignaturesForAddress2(depositToken, { limit: 1 });

		if (lastTxSig.length > 0) {
			const lastTx = await connection.getTransaction(lastTxSig[0].signature.toString());
			//TODO - maybe don't hard code the account index here, but its always going to be the same for now. 
			return lastTx?.transaction.message.accountKeys[0].toString()
		} else {
			return
		}

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
				const lastOwner = await getDespositAccount(nft[0].address);
				nft[0].lastOwner = lastOwner?.toString()
				return nft
			} catch (e) {
				////console.log(`Error ${e}`)
			}
		}
	}
	const initializeExchange = async (nft: INFT) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		const escrowAccount = anchor.web3.Keypair.generate();

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(nft.mint?.toString().slice(0, 32) as string)),
			Buffer.from(anchor.utils.bytes.utf8.encode(escrowAccount.publicKey.toString().slice(0, 32)))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		let initTx = program.transaction.initialize(
			vault_account_bump,
			new anchor.BN(1),
			new anchor.BN(1),
			{
				accounts: {
					initializer: publicKey,
					mint: nft.mint,
					vaultAccount: vault_account_pda,
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
				showAlert('success', `Transaction: ${signature.txid.slice(0, 6)} confirmed!`)
			} catch (e: any) {
				showAlert('error', e.message.toString())
			}
		} catch (e: any) {
			showAlert('error', e.message.toString())
		}
		setExchanged(false);
		setCanceled(false);
		setInitialized(true);
	}
	const exchange = async (toSendNft: INFT, currentEscrow: any, nft: INFT) => {
		if (!publicKey) return;

		let vault_account_pda = null;
		let vault_authority_pda = null;

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(nft.mint?.toString().slice(0, 32))),
			Buffer.from(anchor.utils.bytes.utf8.encode(currentEscrow.pubkey.toString().slice(0, 32)))],
			programID
		);
		vault_account_pda = _vault_account_pda;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`esscrw`)), Buffer.from(anchor.utils.bytes.utf8.encode(`${nft.mint?.toString().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;

		let _escrowAccount = await program.account.escrowAccount.fetch(
			currentEscrow.pubkey
		);

		const initReceiveTokenAccountAddress = (
			await getAtaForMint(toSendNft.mint, _escrowAccount.initializerKey)
		)[0];

		const takerReceiveTokenAccountAddress = (
			await getAtaForMint(nft.mint, publicKey)
		)[0];

		const exchangeTx = await program.transaction.exchange(
			{
				accounts: {
					taker: publicKey,
					mint: toSendNft.mint,
					takerDepositTokenAccount: toSendNft.address,
					initializerDepositTokenMint: nft.mint,
					initializerReceiveTokenAccount: initReceiveTokenAccountAddress,
					takerReceiveTokenAccount: takerReceiveTokenAccountAddress,
					initializer: _escrowAccount.initializerKey,
					escrowAccount: currentEscrow.pubkey,
					vaultAccount: vault_account_pda,
					vaultAuthority: vault_authority_pda,
					tokenProgram: TOKEN_PROGRAM_ID,
					systemProgram: anchor.web3.SystemProgram.programId,
					associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
					rent: anchor.web3.SYSVAR_RENT_PUBKEY,
				},
			});

		exchangeTx.recentBlockhash = (
			await connection.getRecentBlockhash("max")
		).blockhash;
		exchangeTx.feePayer = publicKey;
		try {
			//@ts-ignore
			await wallet.signAllTransactions([exchangeTx])
			let signature = await sendSignedTransaction({ signedTransaction: exchangeTx, connection: connection })
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
			showAlert('success', `Transaction: ${signature.txid.slice(0, 6)} confirmed!`)
		} catch (e: any) {
			showAlert('error', e.message.toString())
		}
		setCanceled(false);
		setInitialized(false);
		setExchanged(true);
	}
	const cancelExchange = async (nft: INFT, currentEscrow: any) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_authority_pda = null;

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(nft.mint?.toString().slice(0, 32))),
			Buffer.from(anchor.utils.bytes.utf8.encode(currentEscrow.pubkey.toString().slice(0, 32)))],
			programID
		);
		vault_account_pda = _vault_account_pda;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`esscrw`)), Buffer.from(anchor.utils.bytes.utf8.encode(`${nft.mint?.toString().slice(0, 5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;
		let _escrowAccount = await program.account.escrowAccount.fetch(
			currentEscrow.pubkey
		);
		const cancelTx = await program.transaction.cancel(
			{
				accounts: {
					initializer: publicKey,
					vaultAccount: vault_account_pda,
					vaultAuthority: vault_authority_pda,
					initializerDepositTokenAccount: _escrowAccount.initializerDepositTokenAccount,
					initializerDepositTokenMint: nft.mint,
					escrowAccount: currentEscrow.pubkey,
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
			let signature = await sendSignedTransaction({ signedTransaction: signedTx, connection: connection });
			let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
			showAlert('success', `Transaction: ${signature.txid.slice(0, 6)} confirmed!`)
		} catch (e: any) {
			showAlert('error', e.message.toString())
		}
		setExchanged(false);
		setInitialized(false);
		setCanceled(true);
	};
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
			//showAlert('error', `${e}`);
		}
		setFetching(false);
	};
	const getUserMatches = async (depositAta: PublicKey, escrowAccountInitializer: String) => {
		const matchPair = holders.filter((matchGrp:any) => {
			return matchGrp.matchA === wallet.publicKey?.toString() || matchGrp.matchB === wallet.publicKey?.toString()
		})
		const matchesList: string[] = [];
		matchPair.forEach((pair:any) => {
			if (pair.matchA === escrowAccountInitializer) {
				matchesList.push(pair.matchB);
			} else if (pair.matchB === escrowAccountInitializer) {
				matchesList.push(pair.matchA);
			}
		})
		return matchesList
	}
	const getAllEscrowAccounts = async () => {
		return await connection.getProgramAccounts(programID);
	}
	const getActiveEscrowAccounts = async (accounts: any) => {
		if (!publicKey) return;
		let matchesList;
		for await (const account of accounts) {
			try {
				const parsedAccount = await program.account.escrowAccount.fetch(account.pubkey);
				matchesList = await getUserMatches(parsedAccount.initializerDepositTokenAccount, parsedAccount.initializerKey.toString());
				if (parsedAccount.initializerKey.toString() === wallet.publicKey || matchesList.length > 0) {
					parsedAccount.pubkey = account.pubkey;
					await setAllEscrowAccounts(allEscrowAccounts => [...allEscrowAccounts?.filter((account) => account.pubkey.toString() !== parsedAccount.pubkey.toString()), parsedAccount]);
				}
			} catch (e) {

			}
		}
		setFetchingEscrowNFTs(false)
		return
	}
	useEffect(() => {
		allEscrowAccounts?.forEach(async (escrowAccount) => {
			const nft = await getEscrowNft(escrowAccount);
			if (!nft) return;
			//@ts-ignore
			await setEscrowNFTs(escrowNFTs => [...escrowNFTs.filter((nftEntry) => nftEntry.address.toString() !== nft[0].address.toString()), nft[0]]);
		})
	}, [allEscrowAccounts])
	useEffect(() => {
		if (!publicKey) {
			return
		} else {
			setAllEscrowAccounts([]);
			setAllFetchedNFTs([]);
			setEscrowNFTs([])
			setFetchingEscrowNFTs(true)
			setFetching(true);
			setInitialized(false);
			setCanceled(false);
			setExchanged(false);
			fetchNFTs({ owner: publicKey });
			(async () => {
				const escrowAccounts = await getAllEscrowAccounts();
				await getActiveEscrowAccounts(escrowAccounts);
			})()
		}
	}, [publicKey, initialized, canceled, exchanged])
	useEffect(() => {
		setActiveEscrow(null);
		setAllFetchedNFTs([])
		setAllEscrowAccounts([])
		setEscrowNFTs([])
	}, [wallet.disconnecting])
	return (
		<Grid container sx={{ minHeight: '1000px', marginBottom:'5px' }}>
			{fetchingEscrowNFTs ? (
				<Grid item md={6}>
					<Grid container justifyContent="center">
						<Grid item>
							<Typography variant='h3' sx={{ marginBottom: 10 }}>Fetching NFTS</Typography>
							<Grid container justifyContent={'center'}>
								<CircularProgress />
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			) : ('')}
			{escrowNFTs && !fetchingEscrowNFTs ? (
				<Grid item md={6}>
					<Grid container justifyContent="center" sx={{ paddingLeft: 5 }}>
						<Typography variant='h3' sx={{ marginBottom: 5 }}>Presents</Typography>
						<Grid container justifyContent="left" spacing={3}>
							{escrowNFTs.map((escrowNFT, index) =>
							(<Grid item key={index}>
								<Card sx={{ maxWidth: 345 }}>
									<CardActionArea onClick={() => { handleOpen(escrowNFT); setNFT(escrowNFT) }}>
										{escrowNFT.lastOwner === wallet.publicKey?.toString() ? (
											[<CardMedia
												component="img"
												alt="NFT"
												height="300"
												image={`${escrowNFT.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
											/>,
											<CardContent>
												<Typography gutterBottom variant="h6" component="div">
													{escrowNFT.metadataOnchain.data.name}
												</Typography>
											</CardContent>]
										) : ([
											<CardMedia
												component="img"
												alt="NFT"
												height="300"
												image={`/images/SSoS_Coin_GIF.gif`}
											/>,
											<CardContent>
												<Typography gutterBottom variant="h6" component="div">
													Hidden until exchanged!
												</Typography>
											</CardContent>])}
									</CardActionArea>
								</Card>
							</Grid>
							)
							)}
						</Grid>
					</Grid>
				</Grid>
			) : ('')}
			<Grid item md={6}>
				<Grid container justifyContent="left" >
					{fetching && allFetchedNFTs?.length === 0 ? (
						<Grid item>
							<Typography variant='h3' sx={{ marginBottom: 10 }}>Fetching NFTS</Typography>
							<Grid container justifyContent={'center'}>
								<CircularProgress />
							</Grid>
						</Grid>
					) : (<div>{!fetching && allFetchedNFTs?.length === 0 ? (
						<Grid item>
							<Typography variant='h3' sx={{ marginBottom: 10 }}>No NFTs Found</Typography>
							<Grid container justifyContent={'center'}>
							</Grid>
						</Grid>
					) : ('')}</div>)}

					{allFetchedNFTs ?
						(<React.Fragment>
							{!fetching && allFetchedNFTs?.length > 0 ? (
								<Typography variant='h3' sx={{ marginBottom: 5 }} >Select an NFT to gift: </Typography>) : ('')}
							<Grid container justifyContent="left" sx={{ paddingRight: 5 }} spacing={3}>
								{allFetchedNFTs.map((nft, index) =>
								(<Grid item key={index} >
									<Card sx={{ maxWidth: 300 }}>
										<CardActionArea onClick={() => { handleOpen(nft); setNFT(nft) }}>
											<CardMedia
												component="img"
												alt="NFT"
												height="300"
												image={`${nft.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
											/>
											<CardContent>
												<Typography gutterBottom variant="h6" component="div">
													{nft.metadataOnchain.data.name}
												</Typography>
											</CardContent>
										</CardActionArea>
									</Card>
								</Grid>
								)
								)}
							</Grid>
						</React.Fragment>
						) : ('')
					}
				</Grid>
			</Grid>
			<ExchangeModal open={open} setOpen={setOpen} handleOpen={handleOpen} handleClose={handleClose} nft={nft} initTx={initializeExchange} cancelTx={cancelExchange} exchangeTx={exchange} activeEscrow={activeEscrow} allFetchedNFTs={allFetchedNFTs}></ExchangeModal>
			<Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleToastClose}>
				<Alert onClose={handleToastClose} severity={severity} sx={{ width: '100%' }}>
					{alertMessage}
				</Alert>
			</Snackbar>
		</Grid >
	)
}
