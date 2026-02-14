/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING WALLET - FUNDING MODULE                                       ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Complete fiat and crypto funding solution for all wallet types              ║
 * ║                                                                              ║
 * ║  Exports:                                                                    ║
 * ║  • FundingCenter - Deposit & funding component                               ║
 * ║  • WithdrawalCenter - Withdrawal & cash-out component                        ║
 * ║  • FiatBalanceCenter - Fiat account management                               ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

export { FundingCenter } from "./funding-center";
export type {
  FundingMethod,
  FundingMethodConfig,
  SavedPaymentMethod,
  DepositParams,
  DepositResult,
  FiatCurrency as FundingFiatCurrency,
  CryptoCurrency as FundingCryptoCurrency,
} from "./funding-center";

export { WithdrawalCenter } from "./withdrawal-center";
export type {
  WithdrawalMethod,
  WithdrawalMethodConfig,
  SavedWithdrawalAccount,
  BankAccountDetails,
  PIXKeyDetails,
  CryptoWithdrawalDetails,
  WithdrawalParams,
  WithdrawalResult,
} from "./withdrawal-center";

export { FiatBalanceCenter } from "./fiat-balance-center";
export type {
  FiatCurrency,
  FiatBalance,
  CurrencyRate,
  RecentTransaction,
} from "./fiat-balance-center";
