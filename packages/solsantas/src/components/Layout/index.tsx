import React from "react";
import "./../../App.less";
import { Grid} from "@material-ui/core";
import Navbar from "../Navbar";

export const AppLayout = React.memo(({ children }) => {
  return (
    <div>
      <Navbar />
      <Grid container>{children}</Grid>
    </div>
  );
});
