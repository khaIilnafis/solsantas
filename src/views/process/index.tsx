import * as React from "react"
import * as anchor from "@project-serum/anchor"
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';
import { Typography, Avatar } from "@mui/material";
import { purple } from '@material-ui/core/colors'
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
                <Box sx={{ width: '70%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={3}>
                    <Grid container justifyContent="center" paddingLeft={5} paddingRight={5}>
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            1
                        </Avatar>
                    </Grid>
                    <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid>
                    <Grid container marginTop={1}>
                        <Typography sx={{ textAlign: 'center' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '70%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={3}>
                    <Grid container justifyContent="center" paddingLeft={5} paddingRight={5}>
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            2
                        </Avatar>
                    </Grid>
                    <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid>
                    <Grid container marginTop={1}>
                        <Typography sx={{ textAlign: 'center' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '70%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={3}>
                    <Grid container justifyContent="center" paddingLeft={5} paddingRight={5}>
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            3
                        </Avatar>
                    </Grid>
                    <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid>
                    <Grid container marginTop={1}>
                        <Typography sx={{ textAlign: 'center' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '70%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={3}>
                    <Grid container justifyContent="center" paddingLeft={5} paddingRight={5}>
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            4
                        </Avatar>
                    </Grid>
                    <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid>
                    <Grid container marginTop={1}>
                        <Typography sx={{ textAlign: 'center' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                    </Grid>
                </Box>
                <Box sx={{ width: '70%' }} marginLeft={'auto'} marginRight={'auto'} marginTop={3}>
                    <Grid container justifyContent="center" paddingLeft={5} paddingRight={5}>
                        <Avatar sx={{ bgcolor: '#DC1FFF', fontWeight: '600', fontFamily: 'Montserrat' }}>
                            5
                        </Avatar>
                    </Grid>
                    <Grid container justifyContent="center" marginTop={1}>
                        <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                    </Grid>
                    <Grid container marginTop={1} marginBottom={3}>
                        <Typography sx={{ textAlign: 'center' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                    </Grid>
                </Box>
            </Box>

        </Grid>
    )
}