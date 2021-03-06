import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { CandyMachineAccount } from '../../utils/candy-machine';
// import { FairLaunchAccount } from './fair-launch';
import { CircularProgress } from '@material-ui/core';
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import { useEffect, useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";

export const CTAButton = styled(Button)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`; // add your styles here

export const MintButton = ({
  onMint,
  candyMachine,
  isMinting,
}: {
  onMint: () => Promise<void>;
  candyMachine: CandyMachineAccount | undefined;
  isMinting: boolean;
}) => {
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [clicked, setClicked] = useState(false);

  const wallet = useWallet();

  useEffect(() => {
    if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
      console.log('Minting');
      onMint();
      setClicked(false);
    }
  }, [gatewayStatus, clicked, setClicked, onMint]);
  return (
    <CTAButton
      disabled={
        !wallet.connected || 
        candyMachine?.state.isSoldOut ||
        isMinting ||
        !candyMachine?.state.isActive
      }
      onClick={async () => {
        setClicked(true);
        if (candyMachine?.state.isActive && candyMachine?.state.gatekeeper) {
          if (gatewayStatus === GatewayStatus.ACTIVE) {
            setClicked(true);
          } else {
            await requestGatewayToken();
          }
        } else {
          await onMint();
          setClicked(false);
        }
      }}
      variant="contained"
    >
      {candyMachine?.state.isSoldOut ? (
        'SOLD OUT'
      ) : isMinting ? (
        <CircularProgress />
      ) : (
      !wallet.connected? 'Please Connect Wallet' : 'MINT'
      )}
    </CTAButton>
  );
};
