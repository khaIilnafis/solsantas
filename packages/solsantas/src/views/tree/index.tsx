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
	Typography
} from '@mui/material';

import {
	clusterApiUrl,
	Connection,
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
	TransactionInstruction,
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
// import { programIds } from '../utils/programIds';
import { useConnection } from "@solana/wallet-adapter-react";
import { NFTGet } from "../../utils/nft-get"
import { INFTParams, INFT } from "../../common/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSleigh } from "@fortawesome/free-solid-svg-icons";

export default function TreeView() {
	const { publicKey, sendTransaction } = useWallet();
	const connection = useConnection()

	// this is what's shown on FE
	const [allFetchedNFTs, setAllFetchedNFTs] = useState<INFT[]>(); // this is everything fetched in mem
	const fetchNFTs = (params: INFTParams) => {
		NFTGet(params, connection.connection)
			.then((fetchedNFTs) => {
				if (fetchedNFTs.length) {
					console.log(fetchedNFTs)
					setAllFetchedNFTs(fetchedNFTs.filter((nft) => {
						//Change this to the update authority of the prod SSoS candy machine
						return nft.metadataOnchain.updateAuthority !== '8rLwDBHVU4GRnt3JgEBp4PcSzLs9tXVj9GDfEovuwBad'
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
							<a href="#" style={{textDecoration: 'none'}}>
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
					<Box sx={{ width: '100%' }}>
						<Typography variant='h3' sx={{textAlign:"center"}}> Fetching NFTs! </Typography>
						<LinearProgress></LinearProgress>
					</Box>
				}
			</Grid>
		</Container>)
}
