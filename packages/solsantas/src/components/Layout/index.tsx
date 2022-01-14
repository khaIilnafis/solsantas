import React from "react";
import "./../../App.less";
import { Grid} from "@mui/material";
import Navbar from "../Navbar";
import Footer from "../../views/footer"

export const AppLayout = React.memo(({ children }) => {
  return (
    <div>
      <Navbar />
      <Grid container sx={{minHeight: 1000}}>
		  {children}
	  <Footer></Footer>
	  </Grid>
    </div>
  );
});
