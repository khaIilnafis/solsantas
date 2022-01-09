import React from 'react';
import { useState } from 'react';
import { Box, Grid } from "@material-ui/core";
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
// import { styled } from '@mui/system';
import { INFT } from '../../common/types';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

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
	activeEscrow: any
}
export default function ExchangeModal(props: ExchangeModalProps) {
	const wallet = useWallet();
	const handleInitClick = (e: React.MouseEvent<HTMLButtonElement>, data: any) => {
		props.initTx(data);
		props.handleClose();
	}
	const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>, data: any) => {
		props.cancelTx(data, props.activeEscrow);
		props.handleClose();
	}
	const handleExchangeClick = (e: React.MouseEvent<HTMLButtonElement>, data: any) => {
		props.cancelTx(data, props.activeEscrow);
		props.handleClose();
	}
	const [nft] = useState(props.nft);
	return (
		<div>
			<Modal
				open={props.open}
				onClose={props.handleClose}
				aria-labelledby="parent-modal-title"
				aria-describedby="parent-modal-description"
			>
				<Box sx={{ ...style }}>
					<h2 id="parent-modal-title">Exchange</h2>
					<p id="parent-modal-description">
						You've been matched! Welcome to the Secret Santa Exchange. Please initialize your exchange below or accept the exchange :)
					</p>
					<Grid container justifyContent="center">
						<Grid item xs={6}>
							{props.nft ? <img
								height="200px"
								width="200px"
								src={`${props.nft.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
								srcSet={`${props.nft.metadataExternal.image}?w=75&h=75&fit=crop&auto=format&dpr=2 2x`}
								alt={props.nft.metadataExternal.name}
								loading="lazy"
							/> : ('No NFT Found')}

						</Grid>
						<Grid item xs={6}>
							{/* ToDo, retrieve the deposited NFT from the matched minter */}
							<div>xs=6</div>
						</Grid>
					</Grid>
					<Grid container justifyContent="center">
						{!props.activeEscrow || (props.activeEscrow.initializerKey.toString() !== wallet.publicKey?.toString()) ? (
							<Grid item xs={4}>
								<Button sx={{ textAlign: 'center' }} onClick={(e) => handleInitClick(e, props.nft)}>Initiate</Button>
							</Grid>
						) :
							('')
						}

						{props.isInitializer ?
							(<Grid item xs={4}>
								<Button sx={{ textAlign: 'center' }} onClick={(e) => handleCancelClick(e, props.nft)}>Cancel</Button>
							</Grid>
							) :
							('')
						}
						{!props.isInitializer && props.activeEscrow ? (
							<Grid item xs={4}>
								<Button sx={{ textAlign: 'center' }} onClick={(e) => handleExchangeClick(e, props.nft)}>Exchange</Button>
							</Grid>
						) :
							('')
						}

					</Grid>
				</Box>
			</Modal>
		</div>
	);
}
