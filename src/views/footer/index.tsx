import React from 'react'
import { Container, Typography, Grid } from '@mui/material'

const styles = {
    footer: {
        marginTop: 'calc(5% + 60px)',
        bottom: 0
    }
}
export default function Footer() {
    return (
    <Container classes={styles.footer} >
        <Grid container justifyContent="center" marginTop={10}>
        <Typography>Copyright © 2021 Secret Santas on Sol</Typography>
        </Grid>
    </Container>
    )
}