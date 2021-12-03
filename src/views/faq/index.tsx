import React from 'react'
import {Grid, Box, Typography} from '@mui/material'
export default function FAQ(){
    return(
        <Grid container marginTop={5}>
            <Grid container justifyContent="center">
                <Typography sx={{
                    fontFamily:'Montserrat',
                    fontWeight: '600',
                    fontSize:'42px'
                }}>
                FAQ
                </Typography>
            </Grid>
            <Grid container justifyContent="center">
                <Typography sx={{
                    fontFamily:'Montserrat',
                    fontWeight: '400',
                    fontSize:'20px'
                }}>
                Your destination to give back to "Charity name" and join a secret Santa.
                </Typography>
            </Grid>
        </Grid>
    )
}