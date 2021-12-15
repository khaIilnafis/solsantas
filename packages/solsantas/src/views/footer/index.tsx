import React from 'react'
import { Container, Typography, Grid } from '@mui/material'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";
const styles = {
    footer: {
        marginTop: 'calc(5% + 60px)',
        bottom: 0
    }
}
export default function Footer() {
    return (
    <Container classes={styles.footer} >
        <Grid container justifyContent="center"marginTop={10}>
        <Grid item>
                  <a href="https://discord.gg/KCWNttjGs4"
                    style={{
                      color: "white",
                      fontFamily: "Montserrat",
                      fontWeight: "600",
                      fontSize: "34px",
                      textAlign: "center",
                      textDecoration: "none",
                      lineHeight: "41px",
                      cursor: "pointer",
                    }}
                  >
                  <FontAwesomeIcon icon={faDiscord}></FontAwesomeIcon>
                  </a>
                </Grid>
        </Grid>
        <Grid container justifyContent="center" >
        <Typography>Copyright © 2021 Secret Santas on Sol</Typography>
        
        </Grid>
    </Container>
    )
}