import * as React from "react"
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';
import { Typography, Avatar } from "@mui/material";
export default function Process() {
    return (
        <Grid container justifyContent="center">
            <Box sx={{
                backgroundColor: '#131313',
                borderRadius: '70px',
                border: '4px solid rgba(255, 255, 255, 0.2)',
            }}>
                <Typography sx={{
                    fontFamily: 'Montserrat',
                    fontWeight: '600',
                    fontSize: '42px',
                    color: '#01FFA3',
                    textAlign: 'center'
                }} 
                marginTop={3}>How it works</Typography>
                <Box sx={{ width: '50%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={5}>
                    <Grid container justifyContent="center">
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            1
                        </Avatar>
                    </Grid>
                    {/* <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid> */}
                    <Grid container marginTop={1} justifyContent="center">
                        <Typography sx={{ textAlign: 'center' }}>Mint a Secret Santa Token to participate. </Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '50%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={5}>
                    <Grid container justifyContent="center" >
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            2
                        </Avatar>
                    </Grid>
                    {/* <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid> */}
                    <Grid container marginTop={1} justifyContent="center">
                        <Typography sx={{ textAlign: 'center' }}>Token holders can deposit gifts into the token vault. Eligible gifts can be Lamports or any valid SPL token.</Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '50%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={5}>
                    <Grid container justifyContent="center" >
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            3
                        </Avatar>
                    </Grid>
                    {/* <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid> */}
                    <Grid container marginTop={1} justifyContent="center">
                        <Typography sx={{ textAlign: 'center' }}>Token holders will be matched with other participants.</Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '50%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={5}>
                    <Grid container justifyContent="center" >
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            4
                        </Avatar>
                    </Grid>
                    {/* <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid> */}
                    <Grid container marginTop={1} justifyContent="center">
                        <Typography sx={{ textAlign: 'center' }}>Participants can open their token vault to receive their gift.</Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '50%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={5}>
                    <Grid container justifyContent="center" >
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            5
                        </Avatar>
                    </Grid>
                    {/* <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid> */}
                    <Grid container marginTop={1} marginBottom={3} justifyContent="center">
                        <Typography sx={{ textAlign: 'center' }}>All proceeds will go to Beauty 2 the Streetz organization. Visit FAQs for more information.</Typography>
                    </Grid>
                </Box>
            </Box>

        </Grid>
    )
}