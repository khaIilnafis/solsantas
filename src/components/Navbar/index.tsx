import React from "react";
import {
  Navbar as Navigation,
  Container,
  Nav,
  NavDropdown,
} from "react-bootstrap";
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

function Navbar() {
  const location = useLocation();

  const wallet = useWallet();
  return (
    <Navigation className="sticky-nav" fixed="top">
      <Container>
      <Navigation.Brand href="/">Sol Santas</Navigation.Brand>
        <Navigation.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
          </Nav>
          <Nav>
            <Nav.Link href="/profile" style={{fontWeight: 500 }}></Nav.Link>
            {!wallet.connected ? (
              <WalletMultiButton></WalletMultiButton>
            ) : (
              <div>
                <WalletDisconnectButton>
                  Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}
                </WalletDisconnectButton>
              </div>
            )}
          </Nav>
        </Navigation.Collapse>
      </Container>
    </Navigation>
  );
}
export default Navbar;
