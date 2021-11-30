import * as React from "react";
import { Grid } from '@material-ui/core';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { Typography } from "@mui/material";
require('./hero.css')

// const SampleMintBtn = styled(Button)({
//     borderRadius: '70px',
//     backgroundColor: '#03E1FF',
//     color:'black'
// })

function Hero() {
    return (
        <Grid container >
            <Grid container justifyContent="center">
                <img src="https://picsum.photos/600/300" alt="Secret Santas on Solana" />
            </Grid>
            <Grid container justifyContent="center">
                <Typography>Secret Santas on Solana</Typography>
            </Grid>
            <Grid container justifyContent="center">
                <hr style={{ "width": "50%", "textAlign": "center" }}></hr>
            </Grid>
            <Grid container justifyContent="center">
                <Typography>Mint window is open for: </Typography>
            </Grid>
            <Grid container justifyContent="center">
                <hr style={{ "width": "50%", "textAlign": "center" }}></hr>
            </Grid>
            <Grid container justifyContent="center" spacing={2}>
                <Grid item>
                    <Grid container justifyContent="center">
                        <Typography className="countdown-time">95</Typography>
                    </Grid>
                    <Grid container justifyContent="center">
                        Hours
                    </Grid>

                </Grid>
                <Grid item>
                    <Grid container justifyContent="center">
                        45
                    </Grid>
                    <Grid container justifyContent="center">
                        Minutes
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container justifyContent="center">
                        05
                    </Grid>
                    <Grid container justifyContent="center">
                        Seconds
                    </Grid>
                </Grid>
            </Grid>
            <Grid container justifyContent="center">
                <hr style={{ "width": "50%", "textAlign": "center" }}></hr>
            </Grid>
            {/* <Grid container justifyContent="center">
                <SampleMintBtn>Mint SSoS Token</SampleMintBtn>
            </Grid> */}
        </Grid>
    )
}

export default Hero