import * as React from "react";
import * as anchor from "@project-serum/anchor";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { useConnection } from "@solana/wallet-adapter-react";
import Mint from "../mint";
import Countdown from "react-countdown";

const treasury = new anchor.web3.PublicKey(
  process.env.REACT_APP_TREASURY_ADDRESS!
);

const candyMachineId = new anchor.web3.PublicKey(
  process.env.REACT_APP_CANDY_MACHINE_ID!
);
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000;

function MintBox() {
  const connection = useConnection();
  const countDownRenderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: any) => {
    if (completed) {
      // Render a complete state
      return (
        <Mint
          candyMachineId={candyMachineId}
          connection={connection.connection}
          startDate={startDateSeed}
          treasury={treasury}
          txTimeout={txTimeout}
          rpcHost={rpcHost}
        ></Mint>
      );
    } else {
      // Render a countdown
      return (
        <Box
          sx={{
            margin: "auto",
            backgroundColor: "#FCF8EA",
            width: "90%",
            borderRadius: "11px",
            marginBottom: "20px",
          }}
        >
          <Grid container justifyContent="center">
            <Grid
              item
              xs={3}
              md={3}
              sx={{
                background:
                  "url(/images/santa-mint-box-line.png) right no-repeat",
              }}
            >
              <Grid container justifyContent="center">
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "700",
                      fontSize: "28px",
                    }}
                  >
                    {days}
                  </Typography>
                </Box>
              </Grid>
              <Grid container justifyContent="center">
                <Box>
                  <p className="time-unit">Days</p>
                </Box>
              </Grid>
            </Grid>
            <Grid
              item
              xs={3}
              md={3}
              sx={{
                background:
                  "url(/images/santa-mint-box-line.png) right no-repeat",
              }}
            >
              <Grid container justifyContent="center">
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "700",
                      fontSize: "28px",
                    }}
                  >
                    {hours}
                  </Typography>
                </Box>
              </Grid>
              <Grid container justifyContent="center">
                <Box>
                  <p className="time-unit">Hours</p>
                </Box>
              </Grid>
            </Grid>
            <Grid
              item
              xs={3}
              md={3}
              sx={{
                background:
                  "url(/images/santa-mint-box-line.png) right no-repeat",
              }}
            >
              <Grid container justifyContent="center">
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "700",
                      fontSize: "28px",
                    }}
                  >
                    {minutes}
                  </Typography>
                </Box>
              </Grid>
              <Grid container justifyContent="center">
                <Box>
                  <p className="time-unit">Minutes</p>
                </Box>
              </Grid>
            </Grid>
            <Grid item xs={3} md={3}>
              <Grid container justifyContent="center">
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "700",
                      fontSize: "28px",
                    }}
                  >
                    {seconds}
                  </Typography>
                </Box>
              </Grid>
              <Grid container justifyContent="center">
                <Box>
                  <p className="time-unit">Seconds</p>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      );
    }
  };
  return (
    <Grid
      container
      justifyContent="center"
      sx={{ marginTop: "60px" }}
      className="mint-window-top"
    >

      <Grid item xs={12} md={6} lg={6} marginBottom={5}>
        <Grid container justifyContent="center" style={{ margin: "auto" }}>
          <div className="floor-watchers-presents">
            <Grid container justifyContent="center" style={{ margin: "auto" }}>
              <p className="floor-watchers-presents-text">Floor Watchers Society Presents</p>
            </Grid>
          </div>
        </Grid>
        <Grid container justifyContent="center" style={{ margin: "auto" }}>
          <Grid item>
            {/* <div className="floor-watchers-presents">
          <Grid container justifyContent="center" style={{ margin: "auto" }}>
            <p className="floor-watchers-presents-text">Floor Watchers Society Presents</p>
          </Grid>
        </div> */}
            <div className="mint-greeting-con">
              <Grid container justifyContent="center" style={{ margin: "auto" }}>
                <p className="mint-greeting-head">Secret Santas on Solana</p>
              </Grid>
              <Grid container style={{ margin: "auto" }}>
                <Box marginLeft={"auto"} marginRight={"auto"}>
                  <p className="mint-greeting-content">
                    Support charity and exchange tokens with the Solana Community!
                  </p>
                </Box>
              </Grid>
            </div>
          </Grid>
        </Grid>

      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <div className={"image-container"}>
          <Box
            sx={{
              color: "black",
            }}
          >
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              marginBottom={3}
            >
              {/* <Typography variant="h4">Mint has been postponed</Typography>               */}
              <p className="mint-word">Mint has completed!</p>
            </Grid>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              marginBottom={3}
            >
              {/* <Typography>Please check discord for details!</Typography> */}
            </Grid>
            <Grid container justifyContent="center" alignItems="center">
              <Grid item>

              <div className="mint-time">
                <Countdown
                  date={Date.parse("25 Dec 2021 17:00:00 EST") + 159800}
                  renderer={countDownRenderer}
                ></Countdown>
              </div>
              </Grid>
            </Grid>
          </Box>
        </div>
      </Grid>
    </Grid>
  );
}
export default MintBox;
