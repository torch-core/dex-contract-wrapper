import { Allocation, Asset } from '@torch-finance/core';

export type ContractSimulateDepositParams = {
  depositAmounts: Allocation[]; // amount of tokens to be deposited
  rates?: Allocation[]; // external rates for yield bearing stable pool
};

export type ContractSimulateDepositResult = {
  lpTokenOut: bigint; // amount of LP token to be received
  virtualPriceBefore: bigint; // virtual price before deposit
  virtualPriceAfter: bigint; // virtual price after deposit
  lpTotalSupply: bigint; // total supply of LP token
};

export type ContractSimulateSwapParams = {
  tokenIn: Asset; // token to be sent
  tokenOut: Asset; // token to be received
  amount: bigint; // amount of token to be sent
  rates?: Allocation[]; // external rates for yield bearing stable pool
};

export type ContractSimulateSwapResult = {
  amountIn: bigint; // amount of token to be sent
  virtualPriceBefore: bigint; // virtual price before swap
  virtualPriceAfter: bigint; // virtual price after swap
};

export type ContractSimulateWithdrawParams = {
  removeAmount: bigint;
  assetOut?: Asset | null; // if specified, only single asset will be removed. By default, all assets will be removed in balanced mode.
  rates?: Allocation[]; // external rates for yield bearing stable pool
};

export type ContractSimulateWithdrawResult = {
  removeAmounts: bigint[]; // amount of tokens to be removed
  virtualPriceBefore: bigint; // virtual price before withdraw
  virtualPriceAfter: bigint; // virtual price after withdraw
};
