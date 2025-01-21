import { Allocation, Asset } from '@torch-finance/core';
import { ContractType, PoolStatus, PoolType } from '../common';
import { Address, Cell, Dictionary } from '@ton/core';

/**
 * Parameters for simulating a deposit into a pool.
 */
export type SimulateDepositParams = {
  /** Amount of tokens to be deposited */
  depositAmounts: Allocation[];
  /** External rates for yield-bearing stable pool (optional) */
  rates?: Allocation[];
};

/**
 * Result of a simulated deposit operation.
 */
export type SimulateDepositResult = {
  /** Amount of LP token to be received */
  lpTokenOut: bigint;
  /** Virtual price before the deposit */
  virtualPriceBefore: bigint;
  /** Virtual price after the deposit */
  virtualPriceAfter: bigint;
  /** Total supply of LP token after the deposit */
  lpTotalSupply: bigint;
};

/**
 * Parameters for simulating a swap with exact input amount.
 */
export type SimulateSwapExactInParams = {
  /** Mode of the swap operation (exactIn) */
  mode: 'ExactIn';
  /** Asset to be sent */
  assetIn: Asset;
  /** Asset to be received */
  assetOut: Asset;
  /** Amount of asset to be sent */
  amountIn: bigint;
  /** External rates for yield-bearing stable pool/meta pool (optional) */
  rates?: Allocation[];
};

/**
 * Parameters for simulating a swap with exact output amount.
 */
export type SimulateSwapExactOutParams = {
  /** Mode of the swap operation (exactOut) */
  mode: 'ExactOut';
  /** Asset to be sent */
  assetIn: Asset;
  /** Asset to be received */
  assetOut: Asset;
  /** Amount of asset expected to be received, use to evaluate amountIn */
  amountOut: bigint;
  /** External rates for yield-bearing stable pool/meta pool (optional) */
  rates?: Allocation[];
};

/**
 * Union type for simulator swap parameters.
 */
export type SimulateSwapParams = SimulateSwapExactInParams | SimulateSwapExactOutParams;

/**
 * Result of a simulated swap with exact input amount.
 */
export type SimulateSwapExactInResult = {
  /** Mode of the swap operation (exactIn) */
  mode: 'ExactIn';
  /** Amount of asset received */
  amountOut: bigint;
  /** Virtual price before the swap */
  virtualPriceBefore: bigint;
  /** Virtual price after the swap */
  virtualPriceAfter: bigint;
};

/**
 * Result of a simulated swap with exact output amount.
 */
export type SimualateSwapExactOutResult = {
  /** Mode of the swap operation (exactOut) */
  mode: 'ExactOut';
  /** Amount of asset sent */
  amountIn: bigint;
  /** Virtual price before the swap */
  virtualPriceBefore: bigint;
  /** Virtual price after the swap */
  virtualPriceAfter: bigint;
};

/**
 * Union type for simulator swap results.
 */
export type SimulateSwapResult = SimulateSwapExactInResult | SimualateSwapExactOutResult;

/**
 * Parameters for simulating a withdrawal from a pool.
 */
export type SimulateWithdrawParams = {
  /** Amount of LP token to be withdrawn */
  lpAmount: bigint;
  /** Single asset to be withdrawn (optional, default: balanced mode) */
  assetOut?: Asset | null;
  /** External rates for yield-bearing stable pool (optional) */
  rates?: Allocation[];
};

/**
 * Result of a simulated withdrawal operation.
 */
export type SimulateWithdrawResult = {
  /** Amounts of assets received after withdrawal */
  amountOuts: bigint[];
  /** Virtual price before the withdrawal */
  virtualPriceBefore: bigint;
  /** Virtual price after the withdrawal */
  virtualPriceAfter: bigint;
};

/**
 * Data about the reserves in the pool.
 */
type ReserveData = {
  /** Reserve allocations for each asset */
  reserves: Allocation[];
  /** Administrative fees for each asset */
  adminFees: Allocation[];
};

/**
 * Basic configuration and data about the pool.
 */
type BasicData = {
  /** Fee numerator for the pool */
  feeNumerator: bigint;
  /** Administrative fee numerator */
  adminFeeNumerator: bigint;
  /** Initial amplification coefficient */
  initA: number;
  /** Future amplification coefficient */
  futureA: number;
  /** Timestamp for initial amplification coefficient */
  initATime: number;
  /** Timestamp for future amplification coefficient */
  futureATime: number;
  /** Total supply of LP tokens */
  lpTotalSupply: bigint;
  /** LP wallet code for the pool */
  lpWalletCode: Cell;
  /** Decimals for each asset */
  decimals: Allocation[];
  /** Plugin configurations */
  plugins: Dictionary<bigint, Cell>;
};

/**
 * Proof-related data about the pool.
 */
type ProofData = {
  /** Base code for the pool */
  baseCode: Cell;
  /** Factory address */
  factory: Address;
};

/**
 * Comprehensive data about the pool.
 */
export type PoolData = {
  /** Contract type of the pool */
  contractType: ContractType;
  /** Type of the pool */
  poolType: PoolType;
  /** Administrator address */
  admin: Address;
  /** Signer key for the pool, verifying the rates signature (if any) */
  signerKey: Buffer;
  /** Current status of the pool */
  status: PoolStatus;
  /** Whether external rates are used */
  useRate: boolean;
  /** Index of the base LP token (for meta pools) */
  baseLpIndex: number;
  /** Sorted list of assets in the pool */
  assets: Asset[];
  /** Reserve data for the pool */
  reserveData: ReserveData;
  /** Basic configuration and data for the pool */
  basicData: BasicData;
  /** Proof-related data for the pool */
  proofData: ProofData;
};
