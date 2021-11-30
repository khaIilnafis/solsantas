import React from "react"
import {useEffect, useState } from "react";
import Countdown from "react-countdown";
import styled from "styled-components";
import {
  AppBar,
  Button,
  CircularProgress,
  Snackbar,
  Toolbar,
  Typography,
  Grid,
  ButtonBase,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "../../utils/candymachine";
// import {DateCountdown} from 'react-date-countdown-timer';
import "./mint.css"

// const Countdown = DateCountdown()
const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)({
  borderRadius: '70px',
  backgroundColor: '#03E1FF',
  color:'black'
});

export interface MintProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Mint = (props: MintProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const anchorWallet = useAnchorWallet();
  console.log(anchorWallet);

  const wallet = useWallet();
  console.log(wallet);

  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const {
        candyMachine,
        goLiveDate,
        itemsAvailable,
        itemsRemaining,
        itemsRedeemed,
      } = await getCandyMachineState(
        anchorWallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      console.log(itemsAvailable)
      console.log(goLiveDate)

      setItemsAvailable(itemsAvailable);
      setItemsRemaining(itemsRemaining);
      setItemsRedeemed(itemsRedeemed);
      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
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

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);

  useEffect(() => {
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;

      const {
        candyMachine,
        goLiveDate,
        itemsRemaining,
        itemsAvailable,
        itemsRedeemed,
      } = await getCandyMachineState(
        anchorWallet,
        props.candyMachineId,
        props.connection
      );

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
      setItemsAvailable(itemsAvailable);
      setItemsRedeemed(itemsRedeemed);
      setItemsRemaining(itemsRemaining);
    })();
  }, [wallet, props.candyMachineId, props.connection]);
  return (
    <main>
      <Grid
        container
        spacing={1}
        justifyContent="center"
        alignItems="center"
        style={{ marginTop: "25px" }}
      >
        <Grid
          container
          item
          xs={12}
          justifyContent="center"
          alignItems="center"
        >
        </Grid>
        {!wallet.connected ? (
          <div></div>
        ) : (
          <Grid
            container
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              container
              item
              xs={3}
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="h6">
                Santa Tokens Remaining: {itemsRemaining}
              </Typography>
            </Grid>
            <Grid
              container
              item
              xs={3}
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="h6">
              Santa Tokens Redeemed: {itemsRedeemed}
              </Typography>
            </Grid>
          </Grid>
        )}
        <Grid
          container
          item
          xs={12}
          justifyContent="center"
          alignItems="center"
        >
          {!wallet.connected ? (
            <MintButton>Connect wallet to mint.</MintButton>
          ) : (
            <MintContainer>
              <Grid container
                item
                xs={12}
                justifyContent="center"
                alignItems="center"><Countdown
              date={startDate.toString()}
              onMount={({ completed }) =>
              completed && setIsActive(true)
            }
              onComplete={() => setIsActive(true)}
              renderer={renderCounter}
              />
              </Grid>
              <Grid container
                item
                xs={12}
                justifyContent="center"
                alignItems="center">
              <MintButton
              disabled={isSoldOut || isMinting || !isActive}
              onClick={onMint}
              variant="contained"
              >
            {isSoldOut?(
              "SOLD OUT"
            ): isActive?(
              isMinting?(
              <CircularProgress />
            ): (
              "Mint now 0.1 SOL"
            )
            ): (
              <div>
              <MintButton disabled={isActive}>
              Mint coming soon
              </MintButton>
              </div>
            )}
              </MintButton>
              </Grid>
            </MintContainer>
          )}
        </Grid>
      </Grid>
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
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Mint;
