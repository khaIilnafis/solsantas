import React, { useLayoutEffect } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Menu, MenuItem, Grid } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import {
  shortenAddress,
} from "../../utils/candymachine";

import { Link as LinkIn } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  // const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useLayoutEffect(() => {
    function updateSize() {
      if (window.innerWidth <= 600) {
        if (document.getElementsByClassName("wallet-adapter-button")[0])
          Array.from(document.getElementsByClassName('wallet-adapter-button') as HTMLCollectionOf<HTMLElement>)[0].style.marginRight = "20px";
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const wallet = useWallet();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit">
        <Toolbar
          sx={{
            marginTop: "0px",
            paddingLeft: "0!important",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            className="logo-container"
          >
            <LinkIn to="/">
              <img
                src="/images/SSoS Logo.png"
                width="50"
                height="69"
                className="d-inline-block align-top nav-icon logo-img"
                alt="Secret Santas on Sol"
              />
              <span className="ellipse-purple"></span>
            </LinkIn>
          </Typography>
          <div className="navbar-column">
            <Toolbar>
              <Grid container justifyContent="center" spacing={10}>
                <Grid item>
                  <a
                    href="/#works"
                    style={{
                      color: "white",
                      fontFamily: "Montserrat",
                      fontWeight: "600",
                      fontSize: "34px",
                      textAlign: "center",
                      textDecoration: "none",
                      lineHeight: "41px",
                      cursor: "pointer",
                    }}
                  >
                    How it works
                  </a>
                </Grid>
                <Grid item>
                  <a href="/#team"
                    style={{
                      color: "white",
                      fontFamily: "Montserrat",
                      fontWeight: "600",
                      fontSize: "34px",
                      textAlign: "center",
                      textDecoration: "none",
                      lineHeight: "41px",
                      cursor: "pointer",
                    }}
                  >
                    The Team
                  </a>
                </Grid>
                <Grid item>
                  <a href="/#faq"
                    style={{
                      color: "white",
                      fontFamily: "Montserrat",
                      fontWeight: "600",
                      fontSize: "34px",
                      textAlign: "center",
                      textDecoration: "none",
                      lineHeight: "41px",
                      cursor: "pointer",
                    }}
                  >
                    FAQ
                  </a>
                </Grid>
                <Grid item>
                  <a href="https://discord.gg/KCWNttjGs4"
                    style={{
                      color: "white",
                      fontFamily: "Montserrat",
                      fontWeight: "600",
                      fontSize: "34px",
                      textAlign: "center",
                      textDecoration: "none",
                      lineHeight: "41px",
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon icon={faDiscord}></FontAwesomeIcon>
                  </a>
                </Grid>
              </Grid>
            </Toolbar>

          </div>
          {!wallet.connected ? (
            <WalletMultiButton
              style={{ marginRight: "30px" }}
            ></WalletMultiButton>
          ) : (
            <WalletDisconnectButton>{wallet.publicKey ? shortenAddress(wallet.publicKey?.toString()) : <p>Disconnect</p>}</WalletDisconnectButton>
          )}
          <div className="navbar-row">
            <Toolbar style={{ marginLeft: "30px", padding: "0px" }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                sx={{ mr: 3 }}
                onClick={handleClick}
              >
                <MenuIcon style={{ width: "40px", height: "40px" }} />
              </IconButton>
              <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
                <MenuItem onClick={handleClose}>
                  <a href="/#how">How it works</a>
                </MenuItem>
                {wallet.connected ? <MenuItem onClick={handleClose}>
                  <LinkIn to="/tree">My Tree</LinkIn>
                </MenuItem> : <span></span>}
                <MenuItem onClick={handleClose}>
                  <a href="/#team">The Team</a>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <a href="/#faq">FAQ</a>
                </MenuItem>
              </Menu>
            </Toolbar>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default Navbar;
