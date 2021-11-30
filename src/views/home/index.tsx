import { WalletAdapter } from "@solana/wallet-adapter-base";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Box, Container } from "@material-ui/core"
import { useConnectionConfig } from "../../contexts/connection";
import { useConnection } from "@solana/wallet-adapter-react";
import Mint from "../mint";
import Hero from "../hero";
import * as anchor from "@project-serum/anchor";
import "./home.css"

const treasury = new anchor.web3.PublicKey(
  process.env.REACT_APP_TREASURY_ADDRESS!
);

const config = new anchor.web3.PublicKey(
  process.env.REACT_APP_CANDY_MACHINE_CONFIG!
);

const candyMachineId = new anchor.web3.PublicKey(
  process.env.REACT_APP_CANDY_MACHINE_ID!
);
const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000;

export const HomeView = () => {
  const connection = useConnection();
  return (
    <Container>
      <Grid container justifyContent="center">
        <Grid item>
          <Hero></Hero>
          <section>
            <Mint
              candyMachineId={candyMachineId}
              config={config}
              connection={connection.connection}
              startDate={startDateSeed}
              treasury={treasury}
              txTimeout={txTimeout}></Mint>
          </section>
        </Grid>
      </Grid>
    </Container>
  );
};
