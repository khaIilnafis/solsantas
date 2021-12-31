import React, { useEffect, useState } from 'react';
import {
	Container,
	Grid,
	Box,
	ImageList,
	ImageListItem,
	ImageListItemBar,
	IconButton,
	LinearProgress,
	Typography,
	Alert
} from '@mui/material';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import {
	clusterApiUrl,
	Connection,
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
	TransactionInstruction,
	Transaction,
	Commitment
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { AnchorEscrow } from '../../../program/target/types/anchor_escrow';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { NFTGet } from "../../utils/nft-get"
import { INFTParams, INFT } from "../../common/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSleigh } from "@fortawesome/free-solid-svg-icons";
import ExchangeModal from '../../components/ExchangeModal'

const updateAuthority = setAuthority()
//Todo add the authority public keys for each network
function setAuthority(){
	switch(process.env.REACT_APP_SOLANA_NETWORK!){
		case 'mainnet-beta': 
			return 'DaSCsY4SLWRDDmJdv84d9AShCCyu8E1ffgMGGHnP6Yry'
		case 'devnet':
			return 'ARJAHAsDVtK242pmBZiJmXSmwM24BMrJfVZBphw6HjMf'
		case 'local':
			return ''
	}
}

export default function TreeView() {
	const { publicKey, sendTransaction } = useWallet();
	const [open, setOpen] = useState(false)
	const [nft, setNFT] = useState<INFT>()
	const connection = useConnection()
	const wallet = useWallet();
	// this is what's shown on FE
	const [allFetchedNFTs, setAllFetchedNFTs] = useState<INFT[]>(); // this is everything fetched in mem

	const handleOpen = () => {
		setOpen(true);		
	}
  	const handleClose = () => {
		setOpen(false);
	}

	//initialize exchange accounts
	const initializeExchange = ()=>{

	}

	const fetchNFTs = (params: INFTParams) => {
		NFTGet(params, connection.connection)
			.then((fetchedNFTs) => {
				if (fetchedNFTs.length) {
					console.log(fetchedNFTs)
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
							<a href="#" style={{textDecoration: 'none'}} onClick={() => {handleOpen();setNFT(nft)}}>
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
					<Box sx={{ width: '100%', height: '900px'}}>
						{wallet.connected ? (
							<div>
								<Typography variant='h3' sx={{ textAlign: "center" }}>Fetching NFTS</Typography>
								<LinearProgress></LinearProgress>
							</div>
							):
							<div>
								<Typography variant='h3' sx={{ textAlign: "center" }}>Connect Wallet</Typography>
							</div>}
					</Box>
				}
			</Grid>
			<ExchangeModal open={open} setOpen={setOpen} handleOpen={handleOpen} handleClose={handleClose} nft={nft}></ExchangeModal>
		</Container>)
}
