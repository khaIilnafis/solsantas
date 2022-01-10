import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AccountInfo, MintInfo, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export async function deserializeToken(mintPubkey: PublicKey, connection: Connection): Promise<Token> {
  // doesn't matter which keypair goes here, we're not using it for anything. This one is long dox'ed.
  const tempKeypair = Keypair.fromSecretKey(
    Uint8Array.from([
      212, 175, 150, 242, 88, 34, 108, 88, 177, 16, 168, 75, 115, 181, 242, 242, 120, 4, 78, 75, 19,
      227, 13, 215, 184, 342, 226, 53, 111, 345, 179, 84, 137, 121, 79, 1, 160, 223, 124, 241, 202,
      203, 220, 237, 50, 242, 57, 158, 226, 207, 203, 188, 43, 28, 70, 110, 214, 234, 251, 15, 249,
      157, 62, 80,
    ]),
  {skipValidation:true});
  return new Token(connection, mintPubkey, TOKEN_PROGRAM_ID, tempKeypair);
}

export async function deserializeTokenAccount(
  mintPubkey: PublicKey,
  tokenAccountPubkey: PublicKey,
  connection: Connection
): Promise<AccountInfo> {
  const t = await deserializeToken(mintPubkey, connection);
  return t.getAccountInfo(tokenAccountPubkey);
}

export async function deserializeTokenMint(mintPubkey: PublicKey, connection: Connection): Promise<MintInfo> {
  const t = await deserializeToken(mintPubkey, connection);
  return t.getMintInfo();
}

export async function getTokenBalance(tokenAccountPubkey: PublicKey, connection: Connection): Promise<number> {
  const balance = await connection.getTokenAccountBalance(tokenAccountPubkey);
  if (!balance.value.uiAmount) {
    return 0;
  }
  return balance.value.uiAmount;
}