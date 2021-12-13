import { WalletAdapter } from "@solana/wallet-adapter-base";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Box, Container } from "@material-ui/core";
import { useConnectionConfig } from "../../contexts/connection";
import { useConnection } from "@solana/wallet-adapter-react";
// import Mint from "../mint";
import Hero from "../hero";
import MintBox from "../mint-box";
import Process from "../process";
import Team from "../team";
import Exchange from "../exchange";
import FAQ from "../faq";
import Footer from "../footer";
import * as anchor from "@project-serum/anchor";
import "./home.css";

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
    <Container className="hello" style={{ padding: "0px" }}>
      <Grid
        container
        justifyContent="center"
        style={{ width: "100%!important", paddingLeft: "0px!important" }}
      >
        <Grid item>
          {/* <Hero></Hero> */}
          <MintBox></MintBox>
          <Process></Process>
          <Team></Team>
          <Exchange></Exchange>
          {/* <FAQ></FAQ>
          <Footer></Footer> */}
        </Grid>
      </Grid>
    </Container>
  );
};
