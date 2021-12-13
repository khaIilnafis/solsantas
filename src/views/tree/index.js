import React from 'react'
import { Grid } from '@mui/material';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection,SystemProgram, SYSVAR_RENT_PUBKEY,TransactionInstruction} from "@solana/web3.js";
import { deserializeUnchecked, serialize } from 'borsh';
import { useWallet } from "@solana/wallet-adapter-react";
import { programIds } from '../utils/programIds';
import { findProgramAddress, StringPublicKey, toPublicKey } from '../utils';

export default function TreeView() {
    const { publicKey, sendTransaction } = useWallet();
    console.log(publicKey.toString());
    if(publicKey){
        (async () => {
            const MY_WALLET_ADDRESS = publicKey.toString();
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
            const accounts = await connection.getParsedProgramAccounts(
                TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
                {
                    filters: [
                        {
                            dataSize: 165, // number of bytes
                        },
                        {
                            memcmp: {
                                offset: 32, // number of bytes
                                bytes: MY_WALLET_ADDRESS, // base58 encoded string
                            },
                        },
                    ],
                }
            );
    
            console.log(
                `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
            );
            accounts.forEach((account, i) => {
                console.log(
                    `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
                );
                console.log(`Mint: ${account.account.data["parsed"]["info"]["mint"]}`);
                console.log(
                    `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
                );
            });
        })();
    }
    return (<Grid></Grid>)
}