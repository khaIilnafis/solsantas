use {
	anchor_lang::prelude::*,
	anchor_spl::associated_token::AssociatedToken,
	anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, Token, TokenAccount, Transfer},
	spl_token::instruction::AuthorityType,
};

declare_id!("6Efhv8qbwioWt44qEuNXYVoyDaxH4uqm7MTmGuXKqW6a");

#[program]
pub mod anchor_escrow {
	use super::*;

	const ESCROW_PDA_PREFIX: &[u8] = b"esscrw";

	pub fn initialize(
		ctx: Context<Initialize>,
		_vault_account_bump: u8,
		initializer_amount: u64,
		taker_amount: u64,
	) -> ProgramResult {
		ctx.accounts.escrow_account.initializer_key = *ctx.accounts.initializer.key;
		ctx.accounts
			.escrow_account
			.initializer_deposit_token_account = *ctx
			.accounts
			.initializer_deposit_token_account
			.to_account_info()
			.key;
		ctx.accounts.escrow_account.initializer_deposit_mint = *ctx.accounts.mint.to_account_info().key;
		// ctx.accounts
		// 	.escrow_account
		// 	.initializer_receive_token_account = *ctx
		// 	.accounts
		// 	.initializer_receive_token_account
		// 	.to_account_info()
		// 	.key;
		ctx.accounts.escrow_account.initializer_amount = initializer_amount;
		ctx.accounts.escrow_account.taker_amount = taker_amount;
		ctx.accounts.escrow_account.state = 1;

		let (vault_authority, _vault_authority_bump) =
			Pubkey::find_program_address(&[ESCROW_PDA_PREFIX, &ctx.accounts.mint.key().to_string()[0..5].as_bytes()],ctx.program_id);
		
		msg!("Program ID: {}",ctx.program_id.to_string());

		token::set_authority(
			ctx.accounts.into_set_authority_context(),
			AuthorityType::AccountOwner,
			Some(vault_authority),
		)?;

		token::transfer(
			ctx.accounts.into_transfer_to_pda_context(),
			ctx.accounts.escrow_account.initializer_amount,
		)?;

		Ok(())
	}
	pub fn cancel(ctx: Context<Cancel>) -> ProgramResult {
		let mint_key_bytes : &str = &*ctx.accounts.initializer_deposit_token_mint.to_account_info().key().to_string();
		let (_vault_authority, vault_authority_bump) =
			Pubkey::find_program_address(&[ESCROW_PDA_PREFIX, mint_key_bytes[0..5].as_bytes()], ctx.program_id);
		let authority_seeds = &[&ESCROW_PDA_PREFIX[..],mint_key_bytes[0..5].as_bytes(), &[vault_authority_bump]];

		token::transfer(
			ctx.accounts
				.into_transfer_to_initializer_context()
				.with_signer(&[&authority_seeds[..]]),
			ctx.accounts.escrow_account.initializer_amount,
		)?;

		token::close_account(
			ctx.accounts
				.into_close_context()
				.with_signer(&[&authority_seeds[..]]),
		)?;
		ctx.accounts.escrow_account.initializer_amount = 0;
		ctx.accounts.escrow_account.state =2;
		Ok(())
	}
	pub fn exchange(ctx: Context<Exchange>) -> ProgramResult {
		let mint_key_bytes : &str = &*ctx.accounts.initializer_deposit_token_mint.to_account_info().key.to_string();
		let (vault_authority, vault_authority_bump) =
			Pubkey::find_program_address(&[ESCROW_PDA_PREFIX, mint_key_bytes[0..5].as_bytes()],ctx.program_id);
		let authority_seeds = &[&ESCROW_PDA_PREFIX[..], mint_key_bytes[0..5].as_bytes(), &[vault_authority_bump]];

		// token::set_authority(
		// 	ctx.accounts.into_set_authority_context(),
		// 	AuthorityType::AccountOwner,
		// 	Some(vault_authority),
		// )?;

		token::transfer(
            ctx.accounts.into_transfer_to_initializer_context(),
            ctx.accounts.escrow_account.taker_amount,
        )?;
		token::transfer(
			ctx.accounts
				.into_transfer_to_taker_context()
				.with_signer(&[&authority_seeds[..]]),
			ctx.accounts.escrow_account.initializer_amount,
		)?;
		ctx.accounts.escrow_account.initializer_amount = 0;
		token::close_account(
			ctx.accounts
				.into_close_context()
				.with_signer(&[&authority_seeds[..]]),
		)?;

		Ok(())
	}
}

#[derive(Accounts)]
#[instruction(vault_account_bump: u8, initializer_amount: u64, taker_amount: u64)]
pub struct Initialize<'info> {
	#[account(mut, signer)]
	pub initializer: AccountInfo<'info>,
	pub mint: Box<Account<'info, Mint>>,
	#[account(
        init_if_needed,
	    seeds = [mint.key().to_string()[0..32].as_bytes(),escrow_account.to_account_info().key().to_string()[0..32].as_bytes()],
        bump = vault_account_bump,
        payer = initializer,
        token::mint = mint,
        token::authority = initializer, 
    )]
	pub vault_account: Account<'info, TokenAccount>,
	#[account(
        mut,
        constraint = initializer_deposit_token_account.amount >= initializer_amount
    )]
	pub initializer_deposit_token_account:Account<'info, TokenAccount>,
	#[account(zero)]
	pub escrow_account: Box<Account<'info, EscrowAccount>>,
	pub system_program: AccountInfo<'info>,
	pub rent: Sysvar<'info, Rent>,
	pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
	#[account(mut, signer)]
	pub initializer: AccountInfo<'info>,
	#[account(mut)]
	pub vault_account: Account<'info, TokenAccount>,
	#[account(mut)]
	pub vault_authority: AccountInfo<'info>,
	#[account(mut)]
	pub initializer_deposit_token_mint: Account<'info, Mint>,
	#[account(mut)]
	pub initializer_deposit_token_account: Account<'info, TokenAccount>,
	#[account(
        mut,
        constraint = escrow_account.initializer_key == *initializer.key,
        constraint = escrow_account.initializer_deposit_token_account == *initializer_deposit_token_account.to_account_info().key,
        close = initializer
    )]
	pub escrow_account: Box<Account<'info, EscrowAccount>>,
	pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Exchange<'info> {
	#[account(mut,signer)]
	pub taker: AccountInfo<'info>,
	pub mint: Box<Account<'info, Mint>>,
	#[account(mut)]
	pub taker_deposit_token_account: Box<Account<'info, TokenAccount>>,
	pub initializer_deposit_token_mint: Box<Account<'info, Mint>>,
	#[account(
        init_if_needed,
        payer = taker,
		associated_token::mint = mint,
        associated_token::authority = initializer,
    )]
	pub initializer_receive_token_account:Box<Account<'info, TokenAccount>>,
	#[account(
        init_if_needed,
        payer = taker,
		associated_token::mint = initializer_deposit_token_mint,
        associated_token::authority = taker,
    )]
	pub taker_receive_token_account:Box<Account<'info, TokenAccount>>,
	#[account(mut)]
	pub initializer: AccountInfo<'info>,
	#[account(
        mut,
        constraint = escrow_account.taker_amount <= taker_deposit_token_account.amount,
        // constraint = escrow_account.initializer_deposit_token_account == *deposit_token_account.to_account_info().key,
        constraint = escrow_account.initializer_key == *initializer.key,
        close = taker
    )]
	pub escrow_account: Box<Account<'info, EscrowAccount>>,
	#[account(mut)]
	pub vault_account: Box<Account<'info, TokenAccount>>,
	#[account(mut)]
	pub vault_authority: AccountInfo<'info>,
	pub token_program: AccountInfo<'info>,
	pub system_program: AccountInfo<'info>,
	pub associated_token_program: Program<'info, AssociatedToken>,
	pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct EscrowAccount {
	pub initializer_key: Pubkey,
	pub taker_key: Pubkey,
	pub initializer_deposit_mint: Pubkey,
	pub initializer_deposit_token_account: Pubkey,
	pub taker_deposit_token_account: Pubkey,
	pub initializer_amount: u64,
	pub state: u8,
	pub taker_amount: u64,
}

impl<'info> Initialize<'info> {
	fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
		let cpi_accounts = Transfer {
			from: self
				.initializer_deposit_token_account
				.to_account_info()
				.clone(),
			to: self.vault_account.to_account_info().clone(),
			authority: self.initializer.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}

	fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
		let cpi_accounts = SetAuthority {
			account_or_mint: self.vault_account.to_account_info().clone(),
			current_authority: self.initializer.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}
}

impl<'info> Cancel<'info> {
	fn into_transfer_to_initializer_context(
		&self,
	) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
		let cpi_accounts = Transfer {
			from: self.vault_account.to_account_info().clone(),
			to: self
				.initializer_deposit_token_account
				.to_account_info()
				.clone(),
			authority: self.vault_authority.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}

	fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
		let cpi_accounts = CloseAccount {
			account: self.vault_account.to_account_info().clone(),
			destination: self.initializer.clone(),
			authority: self.vault_authority.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}
}

impl<'info> Exchange<'info> {
	fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
		let cpi_accounts = SetAuthority {
			account_or_mint: self.vault_account.to_account_info().clone(),
			current_authority: self.taker.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}
	fn into_transfer_to_initializer_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
		//this needs to be an ATA created for the initializer
        let cpi_accounts = Transfer {
            from: self.taker_deposit_token_account.to_account_info().clone(),
            to: self
                .initializer_receive_token_account
                .to_account_info()
                .clone(),
            authority: self.taker.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_transfer_to_taker_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
		//This needs to come from the initializers vault and go to the ata created for the taker
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self.taker_receive_token_account.to_account_info().clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault_account.to_account_info().clone(),
            destination: self.taker.clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}
