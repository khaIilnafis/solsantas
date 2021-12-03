import * as React from "react";
import { createTheme, Grid, ThemeProvider, Box } from '@material-ui/core';
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
// const styles = {
//     santaTitle: {
//         fontFamily: 'Grenze Gotisch',
//         fontWeight: '400',
//         fontSize: '42px',
//         color: '#01FFA3',
//       }
// }
function Hero(props: any) {
    return (
        <Grid container justifyContent="center">
            <Box mb={4}>
                <Typography sx={{
                    fontFamily: 'Grenze Gotisch',
                    fontWeight: '400',
                    fontSize: '60px',
                    color: '#01FFA3',
                }}>Secret Santas on Solana</Typography>
            </Box>
        </Grid>
    )
}

export default Hero