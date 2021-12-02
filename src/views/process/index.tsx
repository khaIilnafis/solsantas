import * as React from "react"
import * as anchor from "@project-serum/anchor"
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';
import { Typography } from "@mui/material";

export default function Process(){
    return(
        <Grid container justifyContent="center">
            <Box sx={{
                backgroundColor: 'black',
                borderRadius: '11%',
                border: '2px solid grey',
                width: '400px',
                height:'400px'
            }}>
                <Typography sx={{
                    fontFamily: 'Montserrat',
                    fontWeight: '600',
                    fontSize: '42px',
                    color: '#01FFA3',
                }}>How it works</Typography>
            </Box>
        </Grid>
    )
}
