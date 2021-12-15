import React, { useEffect } from 'react';
import { Grid } from '@mui/material';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
	clusterApiUrl,
	Connection,
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
	TransactionInstruction,
} from '@solana/web3.js';
import { deserializeUnchecked, serialize } from 'borsh';
import { useWallet } from '@solana/wallet-adapter-react';
// import { programIds } from '../utils/programIds';
import { utils, actions, progr } from '@oyster/common';
import * as solanaWeb3 from '@solana/web3.js';
import { useConnection } from "@solana/wallet-adapter-react";
import {programs} from '@metaplex/js'
// import { findProgramAddress, StringPublicKey, toPublicKey } from '../../utils';
const METADATA_PUBKEY = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
export default function TreeView() {
	const { publicKey, sendTransaction } = useWallet();
	const connection = useConnection()
	if (publicKey) {
		(async () => {
		  const MY_WALLET_ADDRESS = publicKey.toString();
		  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
	
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
			},
		  );
	
		  console.log(
			`Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `,
		  );
		  accounts.forEach((account, i) => {
			  console.log(`Metadata Buffer - ${Buffer.from('metadata')}`);
			  console.log(`Metadata Pubkey to Buffer - ${METADATA_PUBKEY.toBuffer()}`)
			console.log(
			  `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`,
			);
			console.log(`Mint: ${account.account.data['parsed']['info']['mint']}`);
			// getNft(account.account.data['parsed']['info']['mint'])
			console.log(
			  `Amount: ${account.account.data['parsed']['info']['tokenAmount']['uiAmount']}`,
			);
		  });
		})();
	  }
	async function getNft() {
		if (publicKey) {
			try {
				const ownedMetadata = await programs.metadata.Metadata.load(connection, utils.programIds.tokenPublicKey);
				console.log(ownedMetadata);
			  } catch(e) {
				  console.log(e)
				console.log('Failed to fetch metadata');
			  }
		}
	}
	useEffect(() => {
		getNft()
	}, [publicKey])
	return (<Grid></Grid>)
}
