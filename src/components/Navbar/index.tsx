import React from "react";
// import {
//   Navbar as Navigation,
//   Container,
//   Nav,
//   NavDropdown,
// } from "react-bootstrap";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "../../utils/candymachine";

import { useLocation } from 'react-router-dom'
import "./navbar.css";

function Navbar() {
  const location = useLocation();

  const wallet = useWallet();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <img
              src="/images/sss-logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Secret Santas on Sol"
            />
          </Typography>
          {!wallet.connected ? (
            <WalletMultiButton></WalletMultiButton>
          ) : (
            <div>
              <WalletDisconnectButton>
                Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}
              </WalletDisconnectButton>
            </div>
          )}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
    // <Grid container>
    //   <Grid item>
    //   <Navigation className="sticky-nav" fixed="top" bg="dark">
    //     <Container>
    //       <Navigation.Brand href="/">
    //         <img
    //           src="/images/sss-logo.png"
    //           width="30"
    //           height="30"
    //           className="d-inline-block align-top"
    //           alt="React Bootstrap logo"
    //         />
    //       </Navigation.Brand>
    //       <Navigation.Collapse id="responsive-navbar-nav">
    //         <Nav className="me-auto">
    //         </Nav>
    //         <Nav>
    //           <Nav.Link href="/profile" style={{ fontWeight: 500 }}></Nav.Link>
    //           {!wallet.connected ? (
    //             <WalletMultiButton></WalletMultiButton>
    //           ) : (
    //             <div>
    //               <WalletDisconnectButton>
    //                 Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}
    //               </WalletDisconnectButton>
    //             </div>
    //           )}
    //         </Nav>
    //       </Navigation.Collapse>
    //     </Container>
    //   </Navigation>  
    //   </Grid>
    // </Grid>

  );
}
export default Navbar;
