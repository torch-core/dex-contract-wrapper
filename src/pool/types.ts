import { Allocation, Asset } from '@torch-finance/core';
import { ContractType, PoolStatus, PoolType } from '../common';
import { Address, Cell, Dictionary } from '@ton/core';

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

type ReserveData = {
  reserves: Allocation[];
  adminFees: Allocation[];
};

type BasicData = {
  feeNumerator: bigint;
  adminFeeNumerator: bigint;
  initA: number;
  futureA: number;
  initATime: number;
  futureATime: number;
  lpTotalSupply: bigint;
  lpWalletCode: Cell;
  decimals: Allocation[];
  plugins: Dictionary<bigint, Cell>;
};

type ProofData = {
  baseCode: Cell;
  factory: Address;
};

export type PoolData = {
  contractType: ContractType;
  poolType: PoolType;
  admin: Address;
  signerKey: Buffer; // signer key for pool
  status: PoolStatus; // current status of pool (not exists, active, is stop)
  useRate: boolean; // use external reference redemption rate for yield bearing stable pool
  baseLpIndex: number; // LP Token index in the pool, only for meta pool. In base pool, it's always 0.
  assets: Asset[]; // assets in the pool, already sorted
  reserveData: ReserveData;
  basicData: BasicData;
  proofData: ProofData;
};
