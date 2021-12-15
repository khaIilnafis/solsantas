import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Typography, Avatar } from "@mui/material";
export default function Process() {
  return (
    <Grid justifyContent="center">
      <Box>
        <div className="works-container" id="works">
          <p className="works-header">How it works</p>
          <div style={{ width: "90%", margin: "auto" }}>
            <Grid
              container
              sx={{ width: "87%!important", margin: "auto" }}
              justifyContent="center"
            >
              <Grid item md={4} sx={{ margin: "auto" }}>
                <Box sx={{}} marginLeft={"auto"} marginRight={"auto"}>
                  <Grid container justifyContent="center">
                    <div className="circle-bg">
                      <Avatar
                        sx={{
                          bgcolor: "#DC1FFF",
                          fontWeight: "600",
                          fontFamily: "Montserrat",
                          width: "61px",
                          height: "61px",
                          letterSpacing: "-0.5px",
                          margin: "auto",
                          marginTop: "100px",
                        }}
                      >
                        1
                      </Avatar>
                    </div>
                  </Grid>
                  <Grid container marginTop={1} justifyContent="center">
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "220px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        lineHeight: "24px",
                        fontFamily: "Montserrat",
                      }}
                    >
                      Mint a Secret Santa Token to participate.
                    </Typography>
                  </Grid>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box sx={{}} marginLeft={"auto"} marginRight={"auto"}>
                  <Grid container justifyContent="center">
                    <div className="circle-bg">
                      <Avatar
                        sx={{
                          bgcolor: "#DC1FFF",
                          fontWeight: "600",
                          fontFamily: "Montserrat",
                          width: "61px",
                          height: "61px",
                          letterSpacing: "-0.5px",
                          margin: "auto",
                          marginTop: "100px",
                        }}
                      >
                        2
                      </Avatar>
                    </div>
                  </Grid>
                  <Grid container marginTop={1} justifyContent="center">
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "220px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        lineHeight: "24px",
                        fontFamily: "Montserrat",
                      }}
                    >
                      Token holders can deposit gifts into the token vault. Eligible gifts can be Lamports or any valid SPL token.
                    </Typography>
                  </Grid>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box sx={{}} marginLeft={"auto"} marginRight={"auto"}>
                  <Grid container justifyContent="center">
                    <div className="circle-bg">
                      <Avatar
                        sx={{
                          bgcolor: "#DC1FFF",
                          fontWeight: "600",
                          fontFamily: "Montserrat",
                          width: "61px",
                          height: "61px",
                          letterSpacing: "-0.5px",
                          margin: "auto",
                          marginTop: "100px",
                        }}
                      >
                        3
                      </Avatar>
                    </div>
                  </Grid>
                  <Grid container marginTop={1} justifyContent="center">
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "220px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        lineHeight: "24px",
                        fontFamily: "Montserrat",
                      }}
                    >
                     Token holders will be matched with other participants.
                    </Typography>
                  </Grid>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box sx={{}} marginLeft={"auto"} marginRight={"auto"}>
                  <Grid container justifyContent="center">
                    <div className="circle-bg">
                      <Avatar
                        sx={{
                          bgcolor: "#DC1FFF",
                          fontWeight: "600",
                          fontFamily: "Montserrat",
                          width: "61px",
                          height: "61px",
                          letterSpacing: "-0.5px",
                          margin: "auto",
                          marginTop: "100px",
                        }}
                      >
                        4
                      </Avatar>
                    </div>
                  </Grid>
                  <Grid container marginTop={1} justifyContent="center">
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "220px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        lineHeight: "24px",
                        fontFamily: "Montserrat",
                      }}
                    >
                      Participants can open their token vault to receive their gift.
                    </Typography>
                  </Grid>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box sx={{}} marginLeft={"auto"} marginRight={"auto"}>
                  <Grid container justifyContent="center">
                    <div className="circle-bg">
                      <Avatar
                        sx={{
                          bgcolor: "#DC1FFF",
                          fontWeight: "600",
                          fontFamily: "Montserrat",
                          width: "61px",
                          height: "61px",
                          letterSpacing: "-0.5px",
                          margin: "auto",
                          marginTop: "100px",
                        }}
                      >
                        5
                      </Avatar>
                    </div>
                  </Grid>
                  <Grid container marginTop={1} justifyContent="center">
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "220px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        lineHeight: "24px",
                        fontFamily: "Montserrat",
                      }}
                    >
                      All proceeds will go to Beauty 2 the Streetz organization. Visit FAQs for more information.
                    </Typography>
                  </Grid>
                </Box>
              </Grid>
              <Grid item md={4}>
                <div style={{ width: "220px" }}> </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </Box>
    </Grid>
  );
}
