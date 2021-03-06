import * as anchor from '@project-serum/anchor';
import {SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID} from './ids'
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const getAtaForMint = async (
	mint: anchor.web3.PublicKey,
	buyer: anchor.web3.PublicKey,
  ): Promise<[anchor.web3.PublicKey, number]> => {
	return await anchor.web3.PublicKey.findProgramAddress(
	  [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
	  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
	);
  };