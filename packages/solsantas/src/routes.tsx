import { Route, Routes, BrowserRouter } from "react-router-dom";
import React, { useMemo } from "react";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { ConnectionProvider } from "./contexts/connection";
import { AccountsProvider } from "./contexts/accounts";
import { MarketProvider } from "./contexts/market";
import { AppLayout } from "./components/Layout";

import { HomeView } from "./views";
import TreeView from "./views/tree";
import Footer from "./views/footer"
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
require("@solana/wallet-adapter-react-ui/styles.css");
export function AppRoutes() {
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getLedgerWallet(),
      getSolongWallet(),
      getMathWallet(),
      getSolletWallet(),
    ],
    []
  );
  const net = process.env.REACT_APP_SOLANA_NETWORK!
  let network: any;
  console.log(process.env.REACT_APP_SOLANA_NETWORK!)
  console.log(process.env.NODE_ENV)
  console.log(net)
  if(net === 'mainnet-beta'){
    network = WalletAdapterNetwork.Mainnet;
  }else{
    network = WalletAdapterNetwork.Devnet;
  }
  
  console.log(network)
  // const network = WalletAdapterNetwork[net];
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  return (
    <BrowserRouter basename={"/"}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
          <AccountsProvider>
            <WalletModalProvider>
              <MarketProvider>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<HomeView />} />
                    <Route path="/tree" element={<TreeView />} />
                  </Routes>
                  <Footer></Footer>
                </AppLayout>
              </MarketProvider>
            </WalletModalProvider>
          </AccountsProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  );
}
