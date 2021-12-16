import React from "react";
import { Grid, Container } from "@material-ui/core";
import MintBox from "../mint-box";
import Process from "../process";
import Team from "../team";
import FAQ from "../faq";
import "./home.css";

export const HomeView = () => {
  return (
    <Container className="hello" style={{ padding: "0px" }}>
      <Grid
        container
        justifyContent="center"
        style={{ width: "100%!important", paddingLeft: "0px!important" }}
      >
        <Grid item>
          <MintBox></MintBox>
          <Process></Process>
          <Team></Team>
          <FAQ></FAQ>
          {/* <Footer></Footer> */}
        </Grid>
      </Grid>
    </Container>
  );
};
