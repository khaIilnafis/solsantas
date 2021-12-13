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
  const network = WalletAdapterNetwork.Devnet;
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
                </AppLayout>
              </MarketProvider>
            </WalletModalProvider>
          </AccountsProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  );
}
