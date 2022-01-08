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
import { Commitment, PublicKey, Signer, Transaction, } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../../utils/ids'
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

	// this is what's shown on FE
	const [allFetchedNFTs, setAllFetchedNFTs] = useState<INFT[]>(); // this is everything fetched in mem

	// @ts-ignore
	const provider = new Provider(connection, wallet, opts.preflightCommitment);

	anchor.setProvider(provider);
	// console.log(AnchorEscrow)
	const programID = new PublicKey(idl.metadata.address);
	console.log(programID)
	const program = new Program(idl as anchor.Idl, programID, provider);
	console.log(program)
	const handleOpen = () => {
		setOpen(true);
	}
	const handleClose = () => {
		setOpen(false);
	}
	//initialize exchange accounts
	const initializeExchange = async (nft: INFT) => {
		if (!publicKey) return;
		let vault_account_pda = null;
		let vault_account_bump = null;
		let vault_authority_pda = null;

		const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`token-seed`)),Buffer.from(anchor.utils.bytes.utf8.encode(wallet.publicKey?.toBase58().slice(0,5) as string))],
			programID
		);
		vault_account_pda = _vault_account_pda;
		vault_account_bump = _vault_account_bump;

		const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
			[Buffer.from(anchor.utils.bytes.utf8.encode(`escrow-${wallet.publicKey?.toBase58().slice(0,5)}`))],
			programID
		);
		vault_authority_pda = _vault_authority_pda;
		console.log(`Vault Authority PDA ${vault_authority_pda} 
		\n Vault Account PDA ${vault_account_pda}
		\n Vault Account bump ${vault_account_bump}
		\n Vault_Authority_PDA ${_vault_authority_pda} 
		\n Vault_Authority_Bump ${_vault_authority_bump}`);
		const escrowAccount = anchor.web3.Keypair.generate();
		console.log(escrowAccount.publicKey.toBase58());
		/* 
			connection: Connection,
			payer: Signer,
			mintAuthority: PublicKey,
			freezeAuthority: PublicKey | null,
			decimals: number,
			programId: PublicKey,
		*/
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
			console.log(`Transactions:`)
			console.log(txs.txs.map((tx) => tx.txid));
		} catch (e) {
			console.log(`Error: ${e}`)
		}
		console.log(nft);
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
		
		console.log(initTx)
		let signature = await sendSignedTransaction({signedTransaction: initTx, connection:connection})
		console.log(signature);
		let confirmation = await connection.confirmTransaction(signature.txid, 'processed');
		console.log(confirmation)
	}

	const fetchNFTs = (params: INFTParams) => {
		NFTGet(params, connection)
			.then((fetchedNFTs) => {
				if (fetchedNFTs.length) {
					setAllFetchedNFTs(fetchedNFTs.filter((nft) => {
						//Change this to the update authority of the prod SSoS candy machine
						return nft.metadataOnchain.updateAuthority !== updateAuthority
					}))
				} else {

				}
			})
			.catch((err) => { console.log(err) });
	};
	useEffect(() => {
		if (publicKey) {
			fetchNFTs({ owner: publicKey })
		}
	}, [publicKey])
	return (
		<Container>
			<Grid container justifyContent="center">
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
			<ExchangeModal open={open} setOpen={setOpen} handleOpen={handleOpen} handleClose={handleClose} nft={nft} initTx={initializeExchange}></ExchangeModal>
		</Container>)
}
