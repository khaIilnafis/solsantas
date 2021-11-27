import { WalletAdapter } from "@solana/wallet-adapter-base";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Box} from "@material-ui/core"
import {Container} from "react-bootstrap"
import { useConnectionConfig } from "../../contexts/connection";
require('./home.css')

export const HomeView = () => {

  return (
    <Container className="home">
      <Box marginTop={5} >
          <Grid container
            justifyContent="center"
            alignItems="center" className="px-5 mb-2">
            <h4>We're working on the collection. Check back soon!</h4>
          </Grid>
        </Box>
        {/* <Grid
          container
          item
          xs={12}
          justifyContent="center"
          alignItems="center"
        >
          {!wallet.connected ? (
            <WalletMultiButton>Connect your wallet</WalletMultiButton>
          ) : (
            <MintContainer>
              <Grid container
                item
                xs={12}
                justifyContent="center"
                alignItems="center"><Countdown
              date={startDate.toString()}
              onMount={({ completed }) =>
              completed && setIsActive(true)
            }
              onComplete={() => setIsActive(true)}
              renderer={renderCounter}
              />
              </Grid>
              <Grid container
                item
                xs={12}
                justifyContent="center"
                alignItems="center">
              <MintButton
              disabled={isSoldOut || isMinting || !isActive}
              onClick={onMint}
              variant="contained"
              >
            {isSoldOut?(
              "SOLD OUT"
            ): isActive?(
              isMinting?(
              <CircularProgress />
            ): (
              "Mint now 0.5 SOL"
            )
            ): (
              <div>
              <MintButton disabled={isActive}>
              Mint coming soon
              </MintButton>
              </div>
            )}
              </MintButton>
              </Grid>
            </MintContainer>
          )}
        </Grid> */}
    </Container>

  );
};
