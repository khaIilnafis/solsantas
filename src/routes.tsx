import { HashRouter, Route, Switch } from "react-router-dom";
import React, { useMemo } from "react";
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { ConnectionProvider } from "./contexts/connection";
import { AccountsProvider } from "./contexts/accounts";
import { MarketProvider } from "./contexts/market";
import { AppLayout } from "./components/Layout";

import { HomeView } from "./views";
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from '@solana/web3.js';
require('@solana/wallet-adapter-react-ui/styles.css');
export function Routes() {
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
    <HashRouter basename={"/"}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
          <AccountsProvider>
          <WalletModalProvider>
            <MarketProvider>
              <AppLayout>
                  <Switch>
                    <Route exact path="/" component={() => <HomeView />} />
                  </Switch>
              </AppLayout>
            </MarketProvider>
            </WalletModalProvider>
          </AccountsProvider>
        </WalletProvider>
      </ConnectionProvider>
    </HashRouter>
  );
}
