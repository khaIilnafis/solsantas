import React, { useState } from "react";
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
import { Menu, MenuList, MenuItem } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons'

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

import { useLocation, Link } from 'react-router-dom'
import "./navbar.css";

function Navbar() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const wallet = useWallet();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit" sx={{ overflow: 'visible' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, overflow: 'visible' }}>
            <Link to='/'>
              <img
                src="/images/SSoS Logo.png"
                width="50"
                height="69"
                className="d-inline-block align-top nav-icon"
                alt="Secret Santas on Sol"
                style={{marginTop:"5px"}}
              />
              <span className="ellipse-purple"></span>
            </Link>
          </Typography>
          <FontAwesomeIcon icon={["fab", "twitter"]} />
          <FontAwesomeIcon icon={["fab", "discord"]}  />
          {!wallet.connected ? (
            <WalletMultiButton></WalletMultiButton>
          ) : (
            <Toolbar>
              <WalletDisconnectButton style={{marginRight:'20px'}}>
                Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}
              </WalletDisconnectButton>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ mr: 2 }}
                onClick={handleClick}>
                <MenuIcon />
              </IconButton>
              <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
              <MenuItem onClick={handleClose}><Link to='/'>Home</Link></MenuItem>
                <MenuItem onClick={handleClose}><Link to='/tree'>My Tree</Link></MenuItem>
              </Menu>
            </Toolbar>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default Navbar;
