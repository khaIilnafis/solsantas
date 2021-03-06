import React from 'react'
import { Container, Typography, Grid } from '@mui/material'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
const styles = {
	footer: {
		position: 'fixed',
		marginTop: 'calc(95% + 60px)',
		bottom: 0,
	}
}
export default function Footer() {
	return (
		<Container classes={styles.footer} sx={{marginTop:'10px'}}>
			<Grid container justifyContent="center">
				<Grid item>
					<a href="https://discord.gg/WVs3wbRvch"
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
				<Typography>Copyright © 2022 Secret Santas on Sol</Typography>
			</Grid>
		</Container>
	)
}