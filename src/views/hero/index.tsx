import * as React from "react";
import { createTheme, Grid, ThemeProvider, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { Typography } from "@mui/material";
require('./hero.css')
const theme = createTheme();

theme.typography.h1 = {
    h1: {
        fontFamily: "Grenze Gotisch"
    }
}
function Hero(props: any) {
    return (
        <Grid container marginBottom={5}>
            <Grid container justifyContent="center">
                <Typography sx={{
                    fontFamily: 'Grenze Gotisch',
                    fontWeight: '400',
                    fontSize: '60px',
                    color: '#01FFA3',
                }}>Secret Santas on Solana</Typography>
            </Grid>
            <Grid container>
                <Box sx={{width:'50%'}} marginLeft={'auto'} marginRight={'auto'}>
                    <Typography sx={{
                        fontFamily: 'Montserrat',
                        fontWeight: '500',
                        fontSize: '20px',
                        textAlign: 'center'
                    }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    )
}

export default Hero