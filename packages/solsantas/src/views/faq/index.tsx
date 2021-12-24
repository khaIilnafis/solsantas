import React, { useState } from 'react'
import { Container, Grid, Typography, Accordion, AccordionDetails, AccordionSummary, createTheme, ThemeProvider } from '@mui/material'
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
export default function FAQ() {
  const [expanded, setExpanded] = useState();

  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <Container id="faq">
      <ThemeProvider theme={darkTheme}>
        <Grid container marginTop={3} marginBottom={5}>
          <Grid container justifyContent="center">
            <Typography sx={{
              fontFamily: 'Montserrat',
              fontWeight: '600',
              fontSize: '42px',
              color: '#01FFA3'
            }}>
              FAQ
            </Typography>
          </Grid>
        </Grid>
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Typography sx={{ width: '100%', flexShrink: 0 }}>How much is mint?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              The Secret Santa Token will be 0.02 SOL to mint.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
            <Typography sx={{ width: '100%', flexShrink: 0 }}>What is the timeline for the project?</Typography>
          </AccordionSummary>
          <AccordionDetails>
              <ul>
                <li>12/13-12/17 Secret Santa Tokens are open to mint.</li>
                <li>12/18-12/24 Token holders can deposit gifts into the token vault.</li>
                <li>12/24 Token holders are matched with one another.</li>
                <li>12/25 Token holders can open their gifts!</li>
              </ul>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
            <Typography sx={{ width: '100%', flexShrink: 0 }}>What gifts can I deposit into the token vault?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Gifts can be Lamports or any valid SPL token. Spread holiday cheer and be generous!
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
            <Typography sx={{ width: '100%', flexShrink: 0 }}>How will participants be matched?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Users will be automatically matched once the Secret Santa Token is minted. Come back Christmas Day to open your gifts!
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
          <AccordionSummary aria-controls="panel5d-content" id="panel5d-header">
            <Typography sx={{ width: '100%', flexShrink: 0 }}>What gifts can I deposit into the token vault?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Gifts can be Lamports or any valid SPL token. Spread holiday cheer and be generous!
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
          <AccordionSummary aria-controls="panel6d-content" id="panel6d-header">
            <Typography sx={{ width: '100%', flexShrink: 0 }}>What charitable cause will the proceeds go towards?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              100% of token mint will go towards Beauty 2 the Streetz:
              https://www.beauty2thestreetz.org/
              https://twitter.com/beauty2streetz

            </Typography>
          </AccordionDetails>
        </Accordion>
      </ThemeProvider>
    </Container>
  )
}