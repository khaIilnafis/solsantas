import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
export default function Exchange() {
  return (
    <Grid marginTop={5} marginBottom={30}>
      <Grid justifyContent="center">
        <Typography
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "600",
            fontSize: "42px",
            width: "280px",
            lineHeight: " 51px",
          }}
          paddingLeft={5}
          paddingRight={5}
        >
          Secret Santa Exchange
        </Typography>
      </Grid>
      <Grid justifyContent="center">
        <Typography
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "400",
            fontSize: "20px",
            width: "250px",
            lineHeight: " 24px",
            marginTop: "30px",
          }}
          paddingLeft={5}
          paddingRight={5}
        >
          Your destination to give back to "Charity name" and join a secret
          Santa.
        </Typography>
      </Grid>

      <Grid container marginBottom={3}>
        <button className="exchange-button"></button>
      </Grid>
      <Grid justifyContent="center">
        <Typography
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "600",
            fontSize: "42px",
            width: "280px",
            lineHeight: " 51px",
          }}
          paddingLeft={5}
          paddingRight={5}
        >
          FAQ
        </Typography>
      </Grid>
      <Grid justifyContent="center">
        <Typography
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "400",
            fontSize: "20px",
            width: "250px",
            lineHeight: " 24px",
            marginTop: "30px",
          }}
          paddingLeft={5}
          paddingRight={5}
        >
          Your destination to give back to "Charity name" and join a secret
          Santa.
        </Typography>
      </Grid>
    </Grid>
  );
}
