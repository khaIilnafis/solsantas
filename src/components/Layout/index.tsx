import React from "react";
import "./../../App.less";
import { Grid, ThemeProvider, createTheme } from "@material-ui/core"
import { Link } from "react-router-dom";
import { WalletModalProvider } from "@solana/wallet-adapter-ant-design";

import { LABELS } from "../../constants";
import Navbar from "../Navbar";

// const { Header, Content } = Layout;

export const AppLayout = React.memo(({ children }) => {
  return (
      <div>
        <Navbar />
        <Grid container>{children}</Grid>
      </div>
  );
});
