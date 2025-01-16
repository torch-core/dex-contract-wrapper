import { Allocation, Asset } from '@torch-finance/core';

export type SimulateDepositParams = {
  depositAmounts: Allocation[]; // amount of tokens to be deposited
  rates?: Allocation[]; // external rates for yield bearing stable pool
};

export type SimulatorDepositResult = {
  lpTokenOut: bigint; // amount of LP token to be received
  virtualPriceBefore: bigint; // virtual price before deposit
  virtualPriceAfter: bigint; // virtual price after deposit
  lpTotalSupply: bigint; // total supply of LP token after deposit
};

export type SimulateSwapParams = {
  assetIn: Asset; // asset to be sent
  assetOut: Asset; // asset to be received
  amount: bigint; // amount of asset to be sent
  rates?: Allocation[]; // external rates for yield bearing stable pool
};

export type SimulatorSwapResult = {
  amountOut: bigint;
  virtualPriceBefore: bigint;
  virtualPriceAfter: bigint;
};

export type SimulateWithdrawParams = {
  lpAmount: bigint; // amount of LP token to be withdrawed
  assetOut?: Asset | null; // if specified, only single asset will be withdrawed. By default, all assets will be withdrawed in balanced mode.
  rates?: Allocation[]; // external rates for yield bearing stable pool
};

export type SimulateWithdrawResult = {
  amountOuts: bigint[]; // amount of asset to be received after withdraw
  virtualPriceBefore: bigint; // virtual price before withdraw
  virtualPriceAfter: bigint; // virtual price after withdraw
};
