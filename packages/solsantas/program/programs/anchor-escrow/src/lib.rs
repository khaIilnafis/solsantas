pub mod utils;
use {
	crate::utils::*,
	anchor_lang::prelude::*,
	anchor_spl::associated_token::{self, AssociatedToken, Create},
	anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, Token, TokenAccount, Transfer},
	spl_token::instruction::AuthorityType,
};

declare_id!("DM3FhshMv4p33HhiNMnM7ofgaJVNaibzbNZyUNT9whAt");

#[program]
pub mod anchor_escrow {
	use super::*;

	const ESCROW_PDA_PREFIX: &str = "escrow-";

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
		// ctx.accounts
		// 	.escrow_account
		// 	.initializer_receive_token_account = *ctx
		// 	.accounts
		// 	.initializer_receive_token_account
		// 	.to_account_info()
		// 	.key;
		ctx.accounts.escrow_account.initializer_amount = initializer_amount;
		ctx.accounts.escrow_account.taker_amount = taker_amount;

		let mut seed = String::from(ESCROW_PDA_PREFIX);
		seed.push_str(&ctx.accounts.mint.key().to_string()[0..5]);

		let (vault_authority, _vault_authority_bump) =
			Pubkey::find_program_address(&[seed.as_bytes()], ctx.program_id);
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
	pub fn ata(ctx: Context<ATA>) -> ProgramResult {
		assert!(ctx.accounts.token.mint == ctx.accounts.mint.key());
		Ok(())
	}
	pub fn cancel(ctx: Context<Cancel>) -> ProgramResult {
		let mut seed = String::from(ESCROW_PDA_PREFIX);
		seed.push_str(&ctx.accounts.mint.key().to_string()[0..5]);
		let (_vault_authority, vault_authority_bump) =
			Pubkey::find_program_address(&[seed.as_bytes()], ctx.program_id);
		let authority_seeds = &[&seed.as_bytes()[..], &[vault_authority_bump]];

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

		Ok(())
	}
	pub fn withdraw(ctx: Context<Withdraw>) -> ProgramResult {
		let mut seed = String::from(ESCROW_PDA_PREFIX);
		seed.push_str(&ctx.accounts.mint.key().to_string()[0..5]);
		let (_vault_authority, vault_authority_bump) =
			Pubkey::find_program_address(&[seed.as_bytes()], ctx.program_id);
		let authority_seeds = &[&seed.as_bytes()[..], &[vault_authority_bump]];

		token::transfer(
			ctx.accounts.into_transfer_to_initializer_context(),
			ctx.accounts.escrow_account.taker_amount,
		)?;

		token::close_account(
			ctx.accounts
				.into_close_context()
				.with_signer(&[&authority_seeds[..]]),
		)?;

		Ok(())
	}
	pub fn exchange(ctx: Context<Exchange>, _vault_account_bump: u8) -> ProgramResult {
		let mut seed = String::from(ESCROW_PDA_PREFIX);
		seed.push_str(&ctx.accounts.mint.key().to_string()[0..5]);
		let (_vault_authority, vault_authority_bump) =
			Pubkey::find_program_address(&[seed.as_bytes()], ctx.program_id);
		let authority_seeds = &[&seed.as_bytes()[..], &[vault_authority_bump]];


		let (vault_authority, _vault_authority_bump) =
			Pubkey::find_program_address(&[seed.as_bytes()], ctx.program_id);

		let mut taker_seed = String::from(ESCROW_PDA_PREFIX);
		taker_seed.push_str(&ctx.accounts.deposit_mint.key().to_string()[0..5]);
		let (_taker_vault_authority, _taker_vault_authority_bump) =
			Pubkey::find_program_address(&[taker_seed.as_bytes()], ctx.program_id);
		let taker_authority_seeds = &[&taker_seed.as_bytes()[..], &[vault_authority_bump]];

		let (taker_vault_authority, _taker_vault_authority_bump) =
			Pubkey::find_program_address(&[taker_seed.as_bytes()], ctx.program_id);

		token::set_authority(
			ctx.accounts.into_set_authority_context(),
			AuthorityType::AccountOwner,
			Some(taker_vault_authority),
		)?;
		token::transfer(
			ctx.accounts.into_transfer_to_pda_context(),
			ctx.accounts.escrow_account.initializer_amount,
		)?;
		
		token::transfer(
			ctx.accounts
				.into_transfer_to_taker_context()
				.with_signer(&[&authority_seeds[..]]),
			ctx.accounts.escrow_account.initializer_amount,
		)?;

		token::close_account(
			ctx.accounts
				.into_close_context()
				.with_signer(&[&authority_seeds[..]]),
		)?;
		ctx.accounts.escrow_account.state = "withdraw".to_string();
		Ok(())
	}
}

#[derive(Accounts)]
#[instruction(vault_account_bump: u8, initializer_amount: u64)]
pub struct Initialize<'info> {
	#[account(mut, signer)]
	pub initializer: AccountInfo<'info>,
	pub mint: Box<Account<'info, Mint>>,
	#[account(
        init,
        seeds = [b"token-seed".as_ref(), mint.key().to_string()[0..5].as_bytes()],
        bump = vault_account_bump,
        payer = initializer,
        token::mint = mint,
        token::authority = initializer,
    )]
	pub vault_account: Box<Account<'info, TokenAccount>>,
	#[account(
        mut,
        constraint = initializer_deposit_token_account.amount >= initializer_amount
    )]
	pub initializer_deposit_token_account: Box<Account<'info, TokenAccount>>,
	#[account(zero)]
	pub escrow_account: Box<Account<'info, EscrowAccount>>,
	pub system_program: AccountInfo<'info>,
	pub rent: Sysvar<'info, Rent>,
	pub token_program: AccountInfo<'info>,
	// pub associated_token_program: Program<'info, AssociatedToken>,
}
#[derive(Accounts)]
pub struct ATA<'info> {
	#[account(
        init,
        payer = payer,
		associated_token::mint = mint,
        associated_token::authority = payer,
    )]
	pub token: Account<'info, TokenAccount>,
	pub mint: Account<'info, Mint>,
	#[account(mut, signer)]
	pub payer: AccountInfo<'info>,
	pub escrow_account: Account<'info, EscrowAccount>,
	pub rent: Sysvar<'info, Rent>,
	pub system_program: Program<'info, System>,
	pub token_program: Program<'info, Token>,
	pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
	#[account(mut, signer)]
	pub initializer: AccountInfo<'info>,
	pub initializer_receive_token_account: Account<'info, TokenAccount>,
	pub mint: Account<'info, Mint>,
	pub escrow_account: Account<'info, EscrowAccount>,
	#[account(mut)]
	pub taker_vault_account: Account<'info, TokenAccount>,
	pub taker_vault_authority: AccountInfo<'info>,
	pub rent: Sysvar<'info, Rent>,
	pub system_program: Program<'info, System>,
	pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
	#[account(mut, signer)]
	pub initializer: AccountInfo<'info>,
	#[account(mut)]
	pub vault_account: Account<'info, TokenAccount>,
	pub vault_authority: AccountInfo<'info>,
	#[account(mut)]
	pub initializer_deposit_token_account: Account<'info, TokenAccount>,
	#[account(
        mut,
        constraint = escrow_account.initializer_key == *initializer.key,
        constraint = escrow_account.initializer_deposit_token_account == *initializer_deposit_token_account.to_account_info().key,
        close = initializer
    )]
	pub escrow_account: Box<Account<'info, EscrowAccount>>,
	pub mint: Account<'info, Mint>,
	pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(taker_vault_account_bump: u8)]
pub struct Exchange<'info> {
	#[account(signer)]
	pub taker: AccountInfo<'info>,
	#[account(mut)]
	pub taker_deposit_token_account: Box<Account<'info, TokenAccount>>,
	pub taker_receive_token_account: Box<Account<'info, TokenAccount>>,
	#[account(mut)]
	pub initializer_deposit_token_account: Box<Account<'info, TokenAccount>>,
	#[account(mut)]
	pub initializer_receive_token_account: Box<Account<'info, TokenAccount>>,
	#[account(mut)]
	pub initializer: AccountInfo<'info>,
	#[account(
        mut,
        // constraint = escrow_account.taker_amount <= taker_deposit_token_account.amount,
        // constraint = escrow_account.initializer_deposit_token_account == *initializer_deposit_token_account.to_account_info().key,
        // // constraint = escrow_account.initializer_receive_token_account == *initializer_receive_token_account.to_account_info().key,
        // constraint = escrow_account.initializer_key == *initializer.key,
        // close = initializer
    )]
	pub escrow_account: Box<Account<'info, EscrowAccount>>,
	#[account(mut)]
	pub vault_account: Box<Account<'info, TokenAccount>>,
	pub vault_authority: AccountInfo<'info>,
	#[account(
        init,
        seeds = [b"token-seed".as_ref(), deposit_mint.key().to_string()[0..5].as_bytes()],
        bump = taker_vault_account_bump,
        payer = taker,
        token::mint = deposit_mint,
        token::authority = taker,
    )]
	pub taker_vault_account: Box<Account<'info, TokenAccount>>,
	pub mint: Box<Account<'info, Mint>>,
	pub deposit_mint: Box<Account<'info, Mint>>,
	pub token_program: AccountInfo<'info>,
	pub system_program: AccountInfo<'info>,
	pub associated_token_program: Program<'info, AssociatedToken>,
	pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct EscrowAccount {
	pub initializer_key: Pubkey,
	pub taker_key: Pubkey,
	pub initializer_deposit_token_account: Pubkey,
	pub initializer_receive_token_account: Pubkey,
	pub taker_deposit_token_account: Pubkey,
	pub taker_receive_token_account: Pubkey,
	pub initializer_amount: u64,
	pub taker_amount: u64,
	pub state: String,
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
	fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
		let cpi_accounts = Transfer {
			from: self.taker_deposit_token_account.to_account_info().clone(),
			to: self.taker_vault_account.to_account_info().clone(),
			authority: self.taker.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}

	fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
		let cpi_accounts = SetAuthority {
			account_or_mint: self.taker_vault_account.to_account_info().clone(),
			current_authority: self.taker.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}
	fn into_transfer_to_taker_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
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
			destination: self.initializer.clone(),
			authority: self.vault_authority.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}
}

impl<'info> Withdraw<'info> {
	fn into_transfer_to_initializer_context(
		&self,
	) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
		let cpi_accounts = Transfer {
			from: self.taker_vault_account.to_account_info().clone(),
			to: self
				.initializer_receive_token_account
				.to_account_info()
				.clone(),
			authority: self.initializer.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}

	fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
		let cpi_accounts = CloseAccount {
			account: self.taker_vault_account.to_account_info().clone(),
			destination: self.initializer.clone(),
			authority: self.taker_vault_authority.clone(),
		};
		CpiContext::new(self.token_program.clone(), cpi_accounts)
	}
}
