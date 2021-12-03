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

function MintBox() {
    const connection = useConnection();
    return (
        <Grid container justifyContent="center" sx={{ marginBottom: '50px' }}>
            <Grid item xs={6}>
                <Box sx={{
                    color: 'black',
                    backgroundColor: 'white',
                    borderRadius: '11px',
                    opacity: '90%',
                }}>
                    <Grid container justifyContent="center" alignItems="center" marginBottom={3}>
                        <Typography sx={{
                            fontFamily: 'Montserrat',
                            fontWeight: '700',
                            fontSize: '28px'
                        }}
                        marginTop={3}>Mint Opens:</Typography>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center">
                        <Box sx={{
                            backgroundColor: '#FCF8EA',
                            width: '90%',
                            borderRadius: '11px'
                        }}>
                            <Grid container justifyContent="center" >
                                <Grid item xs={12} md={3} sx={{background:'url(/images/santa-mint-box-line.png) right no-repeat'}}>
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
                                <Grid item xs={12} md={3} sx={{background:'url(/images/santa-mint-box-line.png) right no-repeat'}}>
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
                                <Grid item xs={12} md={3} sx={{background:'url(/images/santa-mint-box-line.png) right no-repeat'}}>
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

                        </Box>
                        <Mint
                            candyMachineId={candyMachineId}
                            config={config}
                            connection={connection.connection}
                            startDate={startDateSeed}
                            treasury={treasury}
                            txTimeout={txTimeout}></Mint>
                    </Grid>
                </Box>
            </Grid>
        </Grid>
    )
}
export default MintBox