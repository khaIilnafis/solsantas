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
	AlertColor
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
import holders from "../../utils/matched_dev.json";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../../utils';

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
	const [toastOpen, setToastOpen] = useState(false);
	const [severity, setSeverity] = useState<AlertColor>();
	const [alertMessage, setAlertMessage] = useState<String>();
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
	const handleOpen = (nft: INFT) => {
		if (!nft) return;
		setActiveEscrow(null);
		(async () => {
			let depositTokenAddress;
			if (nft.metadataOnchain.updateAuthority.toString() === publicKey?.toString()) {
				depositTokenAddress = (
					await getAtaForMint(nft.mint, publicKey)
				)[0];
			} else {
				depositTokenAddress = (
					await getAtaForMint(nft.mint, new PublicKey(nft.metadataOnchain.updateAuthority))
				)[0];
			}
			const escrow = await getActiveEscrow(depositTokenAddress?.toString());

			if (escrow) {
				await setActiveEscrow(escrow);
				setOpen(true);
			} else {
				setOpen(true);
			}

		})()
	}
	const getActiveEscrow = async (depositAta: any) => {
		if (!allEscrowAccounts) return;
		const filteredAccounts = await allEscrowAccounts.filter(async (account) => {
			return depositAta === account.initializerDepositTokenAccount
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
				showAlert('success', `Transaction: ${signature.txid.slice(0,6)} confirmed!`)
			} catch (e: any) {
				showAlert('error', e.message.toString())
			}
		} catch (e: any) {
			showAlert('error', e.message.toString())
		}
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
			showAlert('success', `Transaction: ${signature.txid.slice(0,6)} confirmed!`)
		} catch (e:any) {
			showAlert('error', e.message.toString())
		}

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
			showAlert('success', `Transaction: ${signature.txid.slice(0,6)} confirmed!`)
		} catch (e:any) {
			showAlert('error', e.message.toString())
		}


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

	};
	const getUserMatches = async (depositAta: PublicKey, escrowAccountInitializer: String) => {
		const matchPair = holders.filter((matchGrp) => {
			return matchGrp.matchA === wallet.publicKey?.toString() || matchGrp.matchB === wallet.publicKey?.toString()
		})
		const matchesList: string[] = [];
		matchPair.forEach((pair) => {
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
					await setAllEscrowAccounts([parsedAccount])
					setFetching(false);
				}
			} catch (e) {
				setFetching(false);
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

											{escrowNft.lastOwner === wallet.publicKey?.toString() ? (
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
			<Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleToastClose}>
				<Alert onClose={handleToastClose} severity={severity} sx={{ width: '100%' }}>
					{alertMessage}
				</Alert>
			</Snackbar>
		</Container >)
}
