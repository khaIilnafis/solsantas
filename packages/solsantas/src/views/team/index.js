import * as React from "react";
import Grid from "@mui/material/Grid";
import Link from '@mui/material/Link'
import Avatar from "@mui/material/Avatar";
import { Typography } from "@mui/material";

export default function Team() {
  return (
    <div className="team-container" id="team">
      <Typography
        sx={{
          fontFamily: "Montserrat",
          fontWeight: "600",
          fontSize: "42px",
          color: "#01FFA3",
          textAlign:'center'
        }}
      >
        The Team
      </Typography>
      <Grid container >
        <Grid container justifyContent="center" className="team-content">
          <Grid item md={4}>
            <div className="avatar-container1" >
              <div className="dev-content">
                <Avatar alt="Khalil" src="/images/khalil.png" sx={{ width: 131, height: 131,margin:' auto', marginTop: '-70px' }}></Avatar>
                <Grid container justifyContent="center">
                  <Typography
                    sx={{
                      color: "#DC1FFF",
                      fontFamily: "Montserrat",
                      fontWeight: "700",
                      fontSize: "42px",
                      marginTop:'10px'
                    }}
                  >
                    Khalil
                  </Typography>
                </Grid>
                <Grid container justifyContent="center">
                  <Typography 
                    sx={{
                      fontFamily: 'Montserrat',
                      fontStyle: 'normal',
                      fontWeight:' normal',
                      fontSize: '26px',
                      lineHeight: '32px',
                      textAlign: 'center',
                    }}
                  >Developer /<br />Creator</Typography>
                </Grid>
                <Grid container justifyContent="center">
                <Link href="https://twitter.com/khaiilnafis"
                  sx={{
                    fontFamily: 'Montserrat',
                    fontStyle: 'normal',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    lineHeight: '24px',
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                    marginTop:'20px',
                    marginBottom:'20px',
                  }}
                >@KhaIilnafis</Link>
                </Grid>
              </div>
            </div>
          </Grid>
          <Grid item md={4}>
          <div className="avatar-container2" >
            <div className="dev-content" >
              <Avatar alt="Allan" src="/images/allan.png" sx={{ width: 131, height: 131,margin:' auto', marginTop: '-70px' }}></Avatar>
              <Grid container justifyContent="center">
                <Typography
                  sx={{
                    color: "#DC1FFF",
                    fontFamily: "Montserrat",
                    fontWeight: "700",
                    fontSize: "42px",
                    marginTop:'10px'
                  }}
                >
                  Allan
                </Typography>
              </Grid>
              <Grid container justifyContent="center">
                <Typography 
                  sx={{
                    fontFamily: 'Montserrat',
                    fontStyle: 'normal',
                    fontWeight:' normal',
                    fontSize: '26px',
                    lineHeight: '32px',
                    textAlign: 'center',
                  }}
                >Front End<br />Developer</Typography>
              </Grid>
              <Grid container justifyContent="center">
              <Link href="https://twitter.com/khaiilnafis"
                sx={{
                  fontFamily: 'Montserrat',
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  lineHeight: '24px',
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                  marginTop:'20px',
                  marginBottom:'20px',
                }}
              >@so1a11ana</Link>
              </Grid>
            </div>
          </div>
          </Grid>
          <Grid item md={4}>
          <div className="avatar-container3" >
            <div className="dev-content" >
                <Avatar alt="Dre" src="/images/dre.png" sx={{ width: 131, height: 131,margin:' auto', marginTop: '-70px' }}></Avatar>
                <Grid container justifyContent="center">
                  <Typography
                    sx={{
                      color: "#DC1FFF",
                      fontFamily: "Montserrat",
                      fontWeight: "700",
                      fontSize: "42px",
                      marginTop:'10px'
                    }}
                  >
                    DeAndre
                  </Typography>
                </Grid>
                <Grid container justifyContent="center">
                  <Typography 
                    sx={{
                      fontFamily: 'Montserrat',
                      fontStyle: 'normal',
                      fontWeight:' normal',
                      fontSize: '26px',
                      lineHeight: '32px',
                      textAlign: 'center',
                    }}
                  >Product Manager<br /> / Designer</Typography>
                </Grid>
                <Grid container justifyContent="center">
                <Link href="https://twitter.com/khaiilnafis"
                  sx={{
                    fontFamily: 'Montserrat',
                    fontStyle: 'normal',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    lineHeight: '24px',
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                    marginTop:'20px',
                    marginBottom:'20px',
                  }}
                >@DreLaSol</Link>
                </Grid>
              </div>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
