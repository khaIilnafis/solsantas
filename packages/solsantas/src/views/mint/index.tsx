import React from "react"
import { useEffect, useState, useMemo } from "react";
import {
	Snackbar,
	Grid
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { GatewayProvider } from '@civic/solana-gateway-react';
import { MintButton } from './MintButton';
import {
	CandyMachineAccount,
	awaitTransactionSignatureConfirmation,
	getCandyMachineState,
	mintOneToken,
	CANDY_MACHINE_PROGRAM
	// shortenAddress,
} from "../../utils/candy-machine";
// import {DateCountdown} from 'react-date-countdown-timer';
// import "./mint.css"

// const Countdown = DateCountdown()
// const CounterText = styled.span``; // add your styles here

// const MintContainer = styled.div``; // add your styles here

// const MintButton = styled(Button)({
//   borderRadius: '60px',
//   backgroundColor: '#101921',
//   color: 'white',
//   marginTop: '10px',
//   '&:hover': {
//     backgroundColor: '#01FFA3',
//     boxShadow: 'none',
//   },
// });

export interface MintProps {
	candyMachineId: anchor.web3.PublicKey;
	connection: anchor.web3.Connection;
	startDate: number;
	treasury: anchor.web3.PublicKey;
	txTimeout: number;
	rpcHost: string;
}

const Mint = (props: MintProps) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [balance, setBalance] = useState<number>();
	// const [isActive, setIsActive] = useState(false); // true when countdown completes
	// const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
	const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

	// const [itemsAvailable, setItemsAvailable] = useState(0);
	// const [itemsRedeemed, setItemsRedeemed] = useState(0);
	// const [itemsRemaining, setItemsRemaining] = useState(0);
	const rpcUrl = props.rpcHost;
	const [alertState, setAlertState] = useState<AlertState>({
		open: false,
		message: "",
		severity: undefined,
	});

	// const [startDate, setStartDate] = useState(new Date(props.startDate));

	const wallet = useWallet();
	const anchorWallet = useMemo(() => {
		if (
			!wallet ||
			!wallet.publicKey ||
			!wallet.signAllTransactions ||
			!wallet.signTransaction
		) {
			return;
		}

		return {
			publicKey: wallet.publicKey,
			signAllTransactions: wallet.signAllTransactions,
			signTransaction: wallet.signTransaction,
		} as anchor.Wallet;
	}, [wallet]);

	const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
	const onMint = async () => {
		try {
			setIsMinting(true);
			document.getElementById('#identity')?.click();
			if (wallet.connected && candyMachine?.program && wallet.publicKey) {
				const mintTxId = (
					await mintOneToken(candyMachine, wallet.publicKey)
				)[0];

				let status: any = { err: true };
				if (mintTxId) {
					status = await awaitTransactionSignatureConfirmation(
						mintTxId,
						props.txTimeout,
						props.connection,
						'singleGossip',
						true,
					);
				}

				if (!status?.err) {
					setAlertState({
						open: true,
						message: 'Congratulations! Mint succeeded!',
						severity: 'success',
					});
				} else {
					setAlertState({
						open: true,
						message: 'Mint failed! Please try again!',
						severity: 'error',
					});
				}
			}
		} catch (error: any) {
			// TODO: blech:
			let message = error.msg || 'Minting failed! Please try again!';
			if (!error.msg) {
				if (!error.message) {
					message = 'Transaction Timeout! Please try again.';
				} else if (error.message.indexOf('0x138')) {
				} else if (error.message.indexOf('0x137')) {
					message = `SOLD OUT!`;
				} else if (error.message.indexOf('0x135')) {
					message = `Insufficient funds to mint. Please fund your wallet.`;
				}
			} else {
				if (error.code === 311) {
					message = `SOLD OUT!`;
					window.location.reload();
				} else if (error.code === 312) {
					message = `Minting period hasn't started yet.`;
				}
			}

			setAlertState({
				open: true,
				message,
				severity: 'error',
			});
		} finally {
			setIsMinting(false);
		}
	};

	useEffect(() => {
		(async () => {
			if (wallet?.publicKey) {
				const balance = await props.connection.getBalance(wallet.publicKey);
				setBalance(balance / LAMPORTS_PER_SOL);
			}
		})();
	}, [wallet, props.connection]);


	useEffect(() => {
		(async () => {
			if (!anchorWallet) {
				return;
			}
			if (props.candyMachineId) {
				try {
					const cndy = await getCandyMachineState(
						anchorWallet,
						props.candyMachineId,
						props.connection,
					);
					setCandyMachine(cndy);
				} catch (e) {
					console.log('Problem getting candy machine state');
					console.log(e);
				}
			} else {
				console.log('No candy machine detected in configuration.');
			}
		})();
	}, [
		anchorWallet,
		props.candyMachineId,
		props.connection,
	]);
	return (
		<Grid item>
			{candyMachine?.state.isActive &&
				candyMachine?.state.gatekeeper &&
				wallet.publicKey &&
				wallet.signTransaction ? (
				<GatewayProvider
					wallet={{
						publicKey:
							wallet.publicKey ||
							new PublicKey(CANDY_MACHINE_PROGRAM),
						//@ts-ignore
						signTransaction: wallet.signTransaction,
					}}
					// // Replace with following when added
					// gatekeeperNetwork={candyMachine.state.gatekeeper_network}
					gatekeeperNetwork={
						candyMachine?.state?.gatekeeper?.gatekeeperNetwork
					} // This is the ignite (captcha) network
					/// Don't need this for mainnet
					clusterUrl={rpcUrl}
					options={{ autoShowModal: false }}
				>
					<MintButton
						candyMachine={candyMachine}
						isMinting={isMinting}
						onMint={onMint}
					/>
				</GatewayProvider>
			) : (
				<MintButton
					candyMachine={candyMachine}
					isMinting={isMinting}
					onMint={onMint}
				/>
			)}
			<Snackbar
				open={alertState.open}
				autoHideDuration={6000}
				onClose={() => setAlertState({ ...alertState, open: false })}
			>
				<Alert
					onClose={() => setAlertState({ ...alertState, open: false })}
					severity={alertState.severity}
				>
					{alertState.message}
				</Alert>
			</Snackbar>
		</Grid>
	);
};

interface AlertState {
	open: boolean;
	message: string;
	severity: "success" | "info" | "warning" | "error" | undefined;
}

export default Mint;
