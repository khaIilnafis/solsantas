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
	LedgerWalletAdapter,
	PhantomWalletAdapter,
	SlopeWalletAdapter,
	SolflareWalletAdapter,
	SolletExtensionWalletAdapter,
	SolletWalletAdapter,
	TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from "@solana/web3.js";
require("@solana/wallet-adapter-react-ui/styles.css");
export function AppRoutes() {
	const net = process.env.REACT_APP_SOLANA_NETWORK!
	let network: any;
	let endpoint: any;
	console.log(net);
	if (net === 'mainnet-beta') {
		network = WalletAdapterNetwork.Mainnet;
		endpoint = 'https://ssc-dao.genesysgo.net/';
	} else if (net === 'devnet') {
		network = WalletAdapterNetwork.Devnet;
		endpoint = 'https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/';
	}

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SlopeWalletAdapter(),
			new SolflareWalletAdapter(),
			new TorusWalletAdapter(),
			new LedgerWalletAdapter(),
			new SolletWalletAdapter({ network }),
			new SolletExtensionWalletAdapter({ network }),
		],
		[network]
	);

	return (
		<BrowserRouter basename={"/"}>
			<ConnectionProvider endpoint={endpoint}>
				<WalletProvider wallets={wallets} autoConnect>
					<AccountsProvider>
						<WalletModalProvider>
							<MarketProvider>
								<AppLayout>
									<Routes>
										<Route path="/" element={<HomeView />} />
										<Route path="/tree" element={<TreeView />} />
									</Routes>
									{/* <Footer></Footer> */}
								</AppLayout>
							</MarketProvider>
						</WalletModalProvider>
					</AccountsProvider>
				</WalletProvider>
			</ConnectionProvider>
		</BrowserRouter>
	);
}
