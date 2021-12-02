import * as React from "react";
import * as anchor from "@project-serum/anchor";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import {Typography} from "@mui/material";

export default function Team() {
  return (
    <Grid container justifyContent="center">
      <Box>
        <Typography sx={{
                    fontFamily: 'Montserrat',
                    fontWeight: '600',
                    fontSize: '42px',
                    color: '#01FFA3',
                }}>Team</Typography>
      </Box>
    </Grid>
  );
}
