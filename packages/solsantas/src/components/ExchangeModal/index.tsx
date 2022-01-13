/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from 'react';
import { useState } from 'react';
import {
	Container,
	Grid,
	ImageList,
	ImageListItem,
	ImageListItemBar,
	IconButton,
	LinearProgress,
	Typography,
	Snackbar,
	Alert,
	SnackbarCloseReason,
} from '@mui/material';
import { Box } from '@material-ui/core'
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
// import { styled } from '@mui/system';
import { INFT } from '../../common/types';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckCircle, faCircle, faSleigh } from '@fortawesome/free-solid-svg-icons';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 600,
	color: 'white',
	bgcolor: '#101921',
	border: '2px solid #000',
	boxShadow: 24,
	pt: 2,
	px: 4,
	pb: 3,
};
export interface ExchangeModalProps {
	open: boolean,
	setOpen: Function,
	handleOpen: Function,
	handleClose: any,
	nft: INFT | undefined,
	initTx: Function,
	cancelTx: Function,
	exchangeTx: Function,
	isInitializer: boolean,
	activeEscrow: any,
	allFetchedNFTs: INFT[] | undefined
}
export default function ExchangeModal(props: ExchangeModalProps) {
	const wallet = useWallet();
	const [showInitialize, setShowInitialize] = useState(false);
	const [showCancel, setShowCancel] = useState(false);
	const [showExchange, setShowExchange] = useState(false);
	const [selectedNFt, setSelectedNft] = useState<INFT>();
	const [showWithdraw, setShowWithdraw] = useState(false);

	const [open, setOpen] = React.useState(false);

	useEffect(() => {
		if(props.activeEscrow){
			console.log(props.activeEscrow)
			console.log(props.activeEscrow.initializerAmount.toString());
		}
		if (!props.activeEscrow || (props.activeEscrow && props.activeEscrow.initializerAmount.toString() === 0)) {
			setShowInitialize(true)
			setShowExchange(false)
			setShowCancel(false)
		}else if (props.activeEscrow && props.activeEscrow.initializerKey.toString() !== wallet.publicKey?.toString()) {
			setShowExchange(true)
			setShowInitialize(false)
			setShowCancel(false)
		}else if (props.activeEscrow && props.activeEscrow.initializerKey.toString() === wallet.publicKey?.toString()) {
			setShowCancel(true)
			setShowExchange(false)
			setShowInitialize(false)
		}
		console.log(showInitialize);
		console.log(showExchange)
		console.log(showCancel);
		return () => {

		}
	}, [props.activeEscrow, showExchange, showInitialize, showCancel, wallet.publicKey]);
	const selectNft = (e: React.MouseEvent<HTMLAnchorElement>, nft: any) => {
		setSelectedNft(nft)
	}
	const handleInitClick = (e: React.MouseEvent<HTMLButtonElement>, data: any) => {
		console.log(data);
		props.initTx(data);
		props.handleClose();
	}
	const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>, data: any) => {
		props.cancelTx(data, props.activeEscrow);
		props.handleClose();
	}
	const handleExchangeClick = (e: React.MouseEvent<HTMLButtonElement>, data: any, toReceiveNft: any) => {
		console.log(toReceiveNft);
		if (!data) {
			setOpen(true)
			return
		}
		props.exchangeTx(data, props.activeEscrow, toReceiveNft);
		props.handleClose();
	}
	const handleToastClick = () => {
		setOpen(true);
	};

	const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};
	return (
		<Container>
			<Modal
				open={props.open}
				onClose={props.handleClose}
				aria-labelledby="parent-modal-title"
				aria-describedby="parent-modal-description"
			>
				<Box sx={{ ...style }}>
					{showInitialize ? (
						<Grid
							container
							justifyContent="center"
						>
							<h2 id="parent-modal-title">Give a Gift!</h2>
							<p id="parent-modal-description">
								Welcome to the Secret Santa Exchange. You've selected the NFT below to give to your match, click initialize to start the exchange! :)
							</p>

							<Grid item>
								{props.nft ? <img
									style={{ marginLeft: 'auto', marginRight: 'auto' }}
									height="200px"
									width="200px"
									src={`${props.nft.metadataExternal.image}?w=25&h=25&fit=crop&auto=format&dpr=2 2x`}
									srcSet={`${props.nft.metadataExternal.image}?w=25&h=25&fit=crop&auto=format&dpr=2 2x`}
									alt={props.nft.metadataOnchain.data.name}
									loading="lazy"
								/> : ('No NFT Found')}

							</Grid>
						</Grid>) : ('')}
					{showCancel ? (
						<Grid
							container
							justifyContent="center"
						>
							<h2 id="parent-modal-title">Give a Gift!</h2>
							<p id="parent-modal-description">
								Welcome to the Secret Santa Exchange. Your match hasn't deposited an NFT yet, please check back later! :)
							</p>

							<Grid item>
								{props.nft ? <img
									style={{ marginLeft: 'auto', marginRight: 'auto' }}
									height="200px"
									width="200px"
									src={`${props.nft.metadataExternal.image}?w=25&h=25&fit=crop&auto=format&dpr=2 2x`}
									srcSet={`${props.nft.metadataExternal.image}?w=25&h=25&fit=crop&auto=format&dpr=2 2x`}
									alt={props.nft.metadataOnchain.data.name}
									loading="lazy"
								/> : ('No NFT Found')}

							</Grid>
						</Grid>) : ('')}
					{showExchange ? (
						<Grid
							container
							justifyContent="center"
						>
							<h2 id="parent-modal-title">Exchange</h2>
							<p id="parent-modal-description">
								You've been matched! Welcome to the Secret Santa Exchange. Please select the NFT you would like to send and click exchange! :)
							</p>

							<Grid item xs={6}>
								{props.nft ? <img
									style={{ marginLeft: 'auto', marginRight: 'auto' }}
									height="200px"
									width="200px"
									src={`/images/SSoS_Coin_GIF.gif`}
									alt={`Hidden`}
									loading="lazy"
								/> : ('No NFT Found')}

							</Grid>
							<Grid item xs={6}>
								{props.allFetchedNFTs ?
									(
										<Grid item>
											<ImageList sx={{ width: 'auto', height: 'auto' }} cols={2}>
												{props.allFetchedNFTs.map((nft) => (
													<a href="#" style={{ textDecoration: 'none' }} onClick={(e) => { selectNft(e, nft) }} key={nft.metadataOnchain.mint}>
														<ImageListItem key={nft.metadataOnchain.mint} sx={{ width: '100px', height: '100px' }}>
															<img
																src={`${nft.metadataExternal.image}?w=5&h=5&fit=crop 2x`}
																srcSet={`${nft.metadataExternal.image}?w=5&h=5&fit=crop 2x`}
																alt={nft.metadataOnchain.data.name}
																loading="lazy"
															/>
															<ImageListItemBar
																sx={{
																	background:
																		'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
																		'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
																}}
																position="top"
																actionIcon={
																	<IconButton sx={{ color: 'white' }}
																	>
																		{!selectedNFt || selectedNFt.address.toString() !== nft.address.toString() ? (
																			''
																		) : (<FontAwesomeIcon icon={faCheckCircle}></FontAwesomeIcon>)}

																	</IconButton>
																}
																actionPosition="left">
															</ImageListItemBar>
														</ImageListItem>
													</a>
												))}
											</ImageList>
										</Grid>
									)
									: ('')}
							</Grid>
						</Grid>) : ('')
					}

					<Grid container justifyContent="center">
						{showInitialize ? (
							<Grid item>
								<Button sx={{ textAlign: 'center' }} onClick={(e) => handleInitClick(e, props.nft)}>Initiate</Button>
							</Grid>
						) :
							('')
						}

						{showCancel ?
							(<Grid item>
								<Button sx={{ textAlign: 'center' }} onClick={(e) => handleCancelClick(e, props.nft)}>Cancel</Button>
							</Grid>
							) :
							('')
						}
						{showExchange ? (
							<Grid item>
								<Button sx={{ textAlign: 'center' }} onClick={(e) => handleExchangeClick(e, selectedNFt, props.nft)}>Exchange</Button>
							</Grid>
						) :
							('')
						}

					</Grid>
				</Box>
			</Modal>
			<Snackbar open={open} autoHideDuration={6000} onClose={handleToastClose}>
				<Alert onClose={handleToastClose} severity="error" sx={{ width: '100%' }}>
					Please select an NFT!
				</Alert>
			</Snackbar>
		</Container>
	);
}
