import React from "react";
import "./../../App.less";
import { Grid} from "@mui/material";
import Navbar from "../Navbar";
import Footer from "../../views/footer"

export const AppLayout = React.memo(({ children }) => {
  return (
    <div>
      <Navbar />
      <Grid container>
		  {children}
		  <Footer></Footer>
	  </Grid>
    </div>
  );
});
