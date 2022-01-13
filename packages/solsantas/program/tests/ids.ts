import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
const PubKeysInternedMap = new Map<string, PublicKey>();
export type StringPublicKey = string;
export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
// export let TOKEN_PROGRAM_ID = new PublicKey(
//   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
// );
// export let SANTA_ESCROW_PROGRAM_ID = new PublicKey(
// 	"1gBdrswj8KAZfbNLmkiavqAMrxWhdvQ4GWTYdAmLTU4"
// )
export let LENDING_PROGRAM_ID = new PublicKey(
  "TokenLending1111111111111111111111111111111"
);

export let SWAP_PROGRAM_ID = new PublicKey(
  "SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8"
);

export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const VAULT_ID = new PublicKey(
  "vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn");

export const AUCTION_ID = new PublicKey(
  "auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8");

export const METAPLEX_ID = new PublicKey(
  "p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98");

export const PACK_CREATE_ID = new PublicKey(
  "packFeFNZzMfD9aVWL7QbGz1WcU7R9zpf6pvNsw2BLu"
);

export const ORACLE_ID = new PublicKey(
  "rndshKFf48HhGaPbaCd3WQYtgCNKzRgVQ3U2we4Cvf9"
);
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
export const BPF_UPGRADE_LOADER_ID = new PublicKey(
  'BPFLoaderUpgradeab1e11111111111111111111111',
);

export const MEMO_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);
export const SYSTEM = new PublicKey("11111111111111111111111111111111");
export const PROGRAM_IDS = [
  {
    name: "mainnet-beta",
  },
  {
    name: "testnet",
  },
  {
    name: "devnet",
  },
  {
    name: "localnet",
  },
];

export const setAltProgramIds = (envName: string) => {
  let instance = PROGRAM_IDS.find((env) => env.name === envName);
  if (!instance) {
    return;
  }
};

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
  };
};
export const toPublicKey = (key: string | PublicKey) => {
  if (typeof key !== 'string') {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};