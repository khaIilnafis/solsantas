import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import { AnchorEscrow } from "../target/types/anchor_escrow";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  Commitment,
  Signer,
} from "@solana/web3.js";
import { sendSignedTransaction } from "./connection";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { assert } from "chai";
import { keypair } from "./keypair";
import { getAtaForMint } from "./utils";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from "./ids";
describe("anchor-escrow", () => {
  const commitment: Commitment = "processed";
  const connection = new Connection("https://api.devnet.solana.com ", {
    commitment,
    wsEndpoint: "wss://api.devnet.solana.com/",
  });
  const options = anchor.Provider.defaultOptions();
  const wallet = NodeWallet.local();
  const provider = new anchor.Provider(connection, wallet, options);

  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorEscrow as Program<AnchorEscrow>;

  let mintA = null as Token;
  let mintB = null as Token;
  let initializerTokenAccountA = null;
  let initializerTokenAccountB = null;
  let takerTokenAccountA = null;
  let takerTokenAccountB = null;
  let vault_account_pda = null;
  let vault_account_bump = null;
  let vault_authority_pda = null;
  let vault_authority_bump = null;

  const takerAmount = 1;
  const initializerAmount = 1;

  let escrowAccount = anchor.web3.Keypair.generate();
  const payer = keypair;
  const mintAuthority = anchor.web3.Keypair.generate();
  const initializerMainAccount = anchor.web3.Keypair.generate();
  const takerMainAccount = anchor.web3.Keypair.generate();

  it("Initialize program state", async () => {
    console.log(payer.publicKey.toString());
    // Airdropping tokens to a payer.
    await provider.connection
      .confirmTransaction(
        await provider.connection.requestAirdrop(payer.publicKey, 10000000000),
        "processed"
      )
      .catch((e) => console.log(e));

    // Fund Main Accounts
    await provider.send(
      (() => {
        const tx = new Transaction();
        tx.add(
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: initializerMainAccount.publicKey,
            lamports: 100000000,
          }),
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: takerMainAccount.publicKey,
            lamports: 100000000,
          })
        );
        return tx;
      })(),
      [payer]
    );

    mintA = await Token.createMint(
      provider.connection,
      payer,
      mintAuthority.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    mintB = await Token.createMint(
      provider.connection,
      payer,
      mintAuthority.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    initializerTokenAccountA = await mintA.createAccount(
      initializerMainAccount.publicKey
    );
    takerTokenAccountA = await mintA.createAccount(takerMainAccount.publicKey);

    initializerTokenAccountB = await mintB.createAccount(
      initializerMainAccount.publicKey
    );
    takerTokenAccountB = await mintB.createAccount(takerMainAccount.publicKey);

    await mintA.mintTo(
      initializerTokenAccountA,
      mintAuthority.publicKey,
      [mintAuthority],
      initializerAmount
    );

    await mintB.mintTo(
      takerTokenAccountB,
      mintAuthority.publicKey,
      [mintAuthority],
      takerAmount
    );

    let _initializerTokenAccountA = await mintA.getAccountInfo(
      initializerTokenAccountA
    );
    let _takerTokenAccountB = await mintB.getAccountInfo(takerTokenAccountB);

    assert.ok(_initializerTokenAccountA.amount.toNumber() == initializerAmount);
    assert.ok(_takerTokenAccountB.amount.toNumber() == takerAmount);
  });
  //   console.log(Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")));
  //   console.log(Buffer.from(anchor.utils.bytes.utf8.encode(initializerMainAccount.publicKey.toBase58().slice(0,5))));
  it("Initialize escrow", async () => {
    console.log(
      `Mint A Length: ${mintA.publicKey.toString().slice(0, 32).length}`
    );
    console.log(
      Buffer.from(
        anchor.utils.bytes.utf8.encode(mintA.publicKey.toBase58().slice(0, 32))
      )
    );
    // console.log(`Mint B Length: ${initializerTokenAccountA.publicKey.toString().length}`)
    const [_vault_account_pda, _vault_account_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(
            anchor.utils.bytes.utf8.encode(
              mintA.publicKey.toString().slice(0, 32)
            )
          ),
		  Buffer.from(anchor.utils.bytes.utf8.encode(escrowAccount.publicKey.toString().slice(0,32)))
        ],
        program.programId
      );
    vault_account_pda = _vault_account_pda;
    vault_account_bump = _vault_account_bump;
    console.log(`Vault Account Addres: ${vault_account_pda.toString()}`);
    const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
		[Buffer.from(anchor.utils.bytes.utf8.encode("esscrw")),Buffer.from(mintA.publicKey.toString().slice(0,5))],
		program.programId
	  );
	  vault_authority_pda = _vault_authority_pda;
	
	  console.log(`The vault authority is: ${vault_authority_pda.toString()}`)
    console.log(
      `Escrow Account Address: ${escrowAccount.publicKey.toString()}`
    );
    console.log(`Mint A pubkeey ${mintA.publicKey.toString()}`);
    console.log(
      `InitializerTokenAccount ${initializerTokenAccountA.toString()}`
    );

    let _initializerTokenAccountA = await mintA.getAccountInfo(
      initializerTokenAccountA
    );
    console.log(
      `Token Account A Mint: ${_initializerTokenAccountA.mint.toString()}`
    );
    console.log(
      `Retrieved MintA Token Account Key: ${_initializerTokenAccountA.address.toString()}`
    );
    // try {
    //   await program.rpc.initialize(
    //     vault_account_bump,
    //     new anchor.BN(initializerAmount),
    //     new anchor.BN(takerAmount),
    //     {
    //       accounts: {
    //         initializer: initializerMainAccount.publicKey,
    //         mint: mintA.publicKey,
    //         vaultAccount: vault_account_pda,
    //         initializerDepositTokenAccount: initializerTokenAccountA,
    //         escrowAccount: escrowAccount.publicKey,
    //         systemProgram: anchor.web3.SystemProgram.programId,
    //         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //         tokenProgram: TOKEN_PROGRAM_ID,
    //       },
    //       instructions: [
    //         await program.account.escrowAccount.createInstruction(
    //           escrowAccount
    //         ),
    //       ],
    //       signers: [escrowAccount, initializerMainAccount],
    //     }
    //   );
    // } catch (e) {
    //   console.log(e);
    // }

    // let _escrowAccount = await program.account.escrowAccount.fetch(
    //   escrowAccount.publicKey
    // );
    // console.log(
    //   `Escrow Account Key After: ${_escrowAccount.initializerDepositTokenAccount.toString()}`
    // );
	// console.log(
	// 	`Escrow Account Key After: ${_escrowAccount.initializerDepositMint.toString()}`
	//   );
    // let _vault = await mintA.getAccountInfo(vault_account_pda);

    // let _escrowAccount = await program.account.escrowAccount.fetch(
    //   escrowAccount.publicKey
    // );
    // console.log(_escrowAccount);
    // Check that the new owner is the PDA.
    // assert.ok(_vault.owner.equals(vault_authority_pda));

    // Check that the values in the escrow account match what we expect.
    // assert.ok(
    //   _escrowAccount.initializerKey.equals(initializerMainAccount.publicKey)
    // );
    // assert.ok(_escrowAccount.initializerAmount.toNumber() == initializerAmount);
    // assert.ok(_escrowAccount.takerAmount.toNumber() == takerAmount);
    // assert.ok(
    //   _escrowAccount.initializerDepositTokenAccount.equals(
    //     initializerTokenAccountA
    //   )
    // );
    // assert.ok(
    //   _escrowAccount.initializerReceiveTokenAccount.equals(
    //     initializerTokenAccountB
    //   )
    // );
  });

//   it("Exchange escrow state", async () => {
//     const initReceiveTokenAccountAddress = (
//       await getAtaForMint(mintB.publicKey, initializerMainAccount.publicKey)
//     )[0];
// 	console.log(`Initializer Receive Account ${mintB.publicKey.toString()}`)
//     const takerReceiveTokenAccountAddress = (
//       await getAtaForMint(mintA.publicKey, takerMainAccount.publicKey)
//     )[0];
// 	console.log(`Taker Receive Token Account: ${takerReceiveTokenAccountAddress}`)
// 	// let _escrowAccount = await program.account.escrowAccount.fetch(
//     //   escrowAccount.publicKey
//     // );
// 	try{
// 		await program.rpc.exchange({
// 			accounts: {
// 			  taker: takerMainAccount.publicKey,
// 			  mint: mintB.publicKey,
// 			  takerDepositTokenAccount: takerTokenAccountB,
// 			  initializerDepositTokenMint: mintA.publicKey,
// 			  initializerReceiveTokenAccount: initReceiveTokenAccountAddress,
// 			  takerReceiveTokenAccount: takerReceiveTokenAccountAddress,
// 			  initializer: initializerMainAccount.publicKey,
// 			  escrowAccount: escrowAccount.publicKey,
// 			  vaultAccount: vault_account_pda,
// 			  vaultAuthority: vault_authority_pda,
// 			  tokenProgram: TOKEN_PROGRAM_ID,
// 			  systemProgram: anchor.web3.SystemProgram.programId,
// 			  associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
// 			  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
// 			},
// 			signers: [takerMainAccount],
// 		  });
// 	}catch(e){
// 		console.log(e);
// 	}
    
// 	let takerFinalTokenAccount = await mintA.getAccountInfo(takerReceiveTokenAccountAddress);
// 	console.log(takerFinalTokenAccount.mint.toString());

// 	let initializerFinalTokenAccount = await mintB.getAccountInfo(initReceiveTokenAccountAddress);
// 	console.log(initializerFinalTokenAccount.mint.toString());
//     //   let _takerTokenAccountA = await mintA.getAccountInfo(takerTokenAccountA);
//     //   let _takerTokenAccountB = await mintB.getAccountInfo(takerTokenAccountB);
//     //   let _initializerTokenAccountA = await mintA.getAccountInfo(
//     //     initializerTokenAccountA
//     //   );
//     //   let _initializerTokenAccountB = await mintB.getAccountInfo(
//     //     initializerTokenAccountB
//     //   );

//     //   assert.ok(_takerTokenAccountA.amount.toNumber() == initializerAmount);
//     //   assert.ok(_initializerTokenAccountA.amount.toNumber() == 0);
//     //   assert.ok(_initializerTokenAccountB.amount.toNumber() == takerAmount);
//     //   assert.ok(_takerTokenAccountB.amount.toNumber() == 0);
//   });

  it("Initialize escrow and cancel escrow", async () => {
    // Put back tokens into initializer token A account.
    await mintA.mintTo(
      initializerTokenAccountA,
      mintAuthority.publicKey,
      [mintAuthority],
      1
    );

    try {
      await program.rpc.initialize(
        vault_account_bump,
        new anchor.BN(initializerAmount),
        new anchor.BN(takerAmount),
        {
          accounts: {
            initializer: initializerMainAccount.publicKey,
            mint: mintA.publicKey,
            vaultAccount: vault_account_pda,
            initializerDepositTokenAccount: initializerTokenAccountA,
            escrowAccount: escrowAccount.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          instructions: [
            await program.account.escrowAccount.createInstruction(
              escrowAccount
            ),
          ],
          signers: [escrowAccount, initializerMainAccount],
        }
      );
    } catch (e) {
      console.log(e);
    }
    try {
		console.log(`Cancel initializer: ${initializerMainAccount.publicKey.toString()}`)
		console.log(`Cancel vaultAccount: ${vault_account_pda.toString()}`)
		console.log(`Cancel vaultAuthority: ${vault_authority_pda.toString()}`)
		console.log(`Cancel initializerDepositTokenAccount: ${initializerTokenAccountA.toString()}`)
		console.log(`Cancel Deposit Mint: ${mintA.publicKey.toString()}`)
		console.log(`Cancel escrowAccount: ${escrowAccount.toString()}`)
      await program.rpc.cancel({
        accounts: {
          initializer: initializerMainAccount.publicKey,
          vaultAccount: vault_account_pda,
          vaultAuthority: vault_authority_pda,
          initializerDepositTokenAccount: initializerTokenAccountA,
		  initializerDepositTokenMint: mintA.publicKey,
          escrowAccount: escrowAccount.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [initializerMainAccount],
      });
    } catch (e) {
      console.log(e);
    }
    // console.log(signature);
    // Check the final owner should be the provider public key.
    // const _initializerTokenAccountA = await mintA.getAccountInfo(
    //   initializerTokenAccountA
    // );
    // assert.ok(
    //   _initializerTokenAccountA.owner.equals(initializerMainAccount.publicKey)
    // );

    // // Check all the funds are still there.
    // assert.ok(_initializerTokenAccountA.amount.toNumber() == initializerAmount);
  });
});
