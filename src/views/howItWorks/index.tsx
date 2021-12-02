import * as React from "react"
import * as anchor from "@project-serum/anchor"
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';
import { Typography } from "@mui/material";
import { useConnection } from "@solana/wallet-adapter-react";
import Mint from '../mint'
const treasury = new anchor.web3.PublicKey(
    process.env.REACT_APP_TREASURY_ADDRESS!
);

const config = new anchor.web3.PublicKey(
    process.env.REACT_APP_CANDY_MACHINE_CONFIG!
);

const candyMachineId = new anchor.web3.PublicKey(
    process.env.REACT_APP_CANDY_MACHINE_ID!
);
const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000;

function How() {
    const connection = useConnection();
    return (
        <Grid container justifyContent="center" sx={{marginBottom:'50px'}}>
            <Box sx={{
                color: 'black',
                backgroundColor: 'white',
                borderRadius: '11px',
                // height: '396px',
                opacity: '90%',
                // display: 'flex',
                // flexWrap: 'wrap',
                '& > :not(style)': {
                    // m: 1, 
                    // width: 600,
                    // height: 200,
                },
            }}>
                <Grid container justifyContent="center" alignItems="center">
                    <Typography sx={{
                        fontFamily: 'Montserrat',
                        fontWeight: '700',
                        fontSize: '28px'
                    }}>Mint Opens:</Typography>
                </Grid>
                <Grid container justifyContent="center" alignItems="center">
                    <Box sx={{
                        backgroundColor: '#FCF8EA',
                        width: '90%',
                        borderRadius: '11px'
                    }}>
                        <Grid container justifyContent="center">
                            <Grid item xs={12} md={3}>
                                <Grid container justifyContent="center">
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontFamily: 'Montserrat',
                                                fontWeight: '700',
                                                fontSize: '28px'
                                            }}>
                                            12
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid container justifyContent="center">
                                    <Box><Typography
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontWeight: '700',
                                            fontSize: '28px'
                                        }}>
                                        Days
                                    </Typography></Box>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Grid container justifyContent="center">
                                    <Box><Typography
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontWeight: '700',
                                            fontSize: '28px'
                                        }}>
                                        23
                                    </Typography></Box>
                                </Grid>
                                <Grid container justifyContent="center">
                                    <Box><Typography
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontWeight: '700',
                                            fontSize: '28px'
                                        }}>
                                        Hours
                                    </Typography></Box>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Grid container justifyContent="center">
                                    <Box><Typography
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontWeight: '700',
                                            fontSize: '28px'
                                        }}>
                                        45
                                    </Typography></Box>
                                </Grid>
                                <Grid container justifyContent="center">
                                    <Box><Typography
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontWeight: '700',
                                            fontSize: '28px'
                                        }}>
                                        Minutes
                                    </Typography></Box>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Grid container justifyContent="center">
                                    <Box><Typography
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontWeight: '700',
                                            fontSize: '28px'
                                        }}>
                                        05
                                    </Typography></Box>
                                </Grid>
                                <Grid container justifyContent="center">
                                    <Box><Typography
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontWeight: '700',
                                            fontSize: '28px'
                                        }}>
                                        Seconds
                                    </Typography></Box>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Mint
                            candyMachineId={candyMachineId}
                            config={config}
                            connection={connection.connection}
                            startDate={startDateSeed}
                            treasury={treasury}
                            txTimeout={txTimeout}></Mint>
                    </Box>
                </Grid>

                {/* <Paper elevation={3}>
                    <Grid container margin="40">
                        <Grid container justifyContent="center">
                            <Typography>How it works</Typography>
                        </Grid>
                        <Grid container justifyContent="center">
                            <Avatar sx={{ bgcolor: pink[500] }}>
                               1
                            </Avatar>
                        </Grid>
                        <Grid container justifyContent="center">
                            <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                        </Grid>
                        <Grid container justifyContent="center" alignItems="center">
                            <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid container justifyContent="center">
                            <Typography>How it works</Typography>
                        </Grid>
                        <Grid container justifyContent="center">
                            <Avatar sx={{ bgcolor: pink[500] }}>
                                2
                            </Avatar>
                        </Grid>
                        <Grid container justifyContent="center">
                            <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                        </Grid>
                        <Grid container justifyContent="center" alignItems="center">
                            <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid container justifyContent="center">
                            <Typography>How it works</Typography>
                        </Grid>
                        <Grid container justifyContent="center">
                            <Avatar sx={{ bgcolor: pink[500] }}>
                               3
                            </Avatar>
                        </Grid>
                        <Grid container justifyContent="center">
                            <Typography>Mint Secret Santa on SOL Token for 0.02SOL</Typography>
                        </Grid>
                        <Grid container justifyContent="center" alignItems="center">
                            <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique tincidunt nibh et dignissim. </Typography>
                        </Grid>
                    </Grid>
                </Paper> */}
            </Box>
        </Grid>
    )
}
export default How