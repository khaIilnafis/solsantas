import React from 'react';
import { useState } from 'react';
import { Box, Grid } from "@material-ui/core";
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import { INFT, INFTParams } from '../../common/types';

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

}
export default function ExchangeModal(props: ExchangeModalProps) {
    console.log(props.nft)
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
                                alt={props.nft.metadataOnchain.data.name}
                                loading="lazy"
                            /> : ('No NFT Found')}

                        </Grid>
                        <Grid item xs={6}>
                            {/* ToDo, retrieve the deposited NFT from the matched minter */}
                            <div>xs=6</div>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="center">
                        <Grid item xs={4}><Button sx={{ textAlign: 'center' }}>Initiate</Button></Grid>
                        <Grid item xs={4}><Button sx={{ textAlign: 'center' }}>Cancel</Button></Grid>
                        <Grid item xs={4}><Button sx={{ textAlign: 'center' }}>Exchange</Button></Grid>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}
