import { Address, Cell, Dictionary } from '@ton/core';
import { Allocation, SignedRate } from '@torch-finance/core';
import { Asset } from '@torch-finance/core';

/**
 * Configuration for a deposit transaction.
 */
type DepositConfig = {
  /**
   * The minimum amount of LP tokens expected to receive from the deposit.
   * Transactions that result in fewer LP tokens will fail.
   */
  minLpAmount?: bigint | null;

  /**
   * The address to receive the LP tokens.
   * Defaults to the initiator of the deposit transaction if set to null.
   */
  recipient?: Address | null;

  /**
   * The signed relative price, used for price-sensitive deposits in certain pools.
   * Ensure this value is securely generated and verified to prevent exploits.
   */
  signedRate?: SignedRate | null;

  /**
   * The calldata to be executed upon successful deposit completion.
   */
  fulfillPayload?: Cell | null;

  /**
   * The calldata returned to the transaction initiator upon deposit failure.
   */
  rejectPayload?: Cell | null;

  /**
   * Reserved for future use. Currently unsupported extra payload.
   */
  extraPayload?: Dictionary<bigint, Cell> | null;
};

/**
 * Payload for a deposit transaction.
 */
export type DepositPayload = {
  /**
   * The unique identifier for the query.
   */
  queryId: bigint;

  /**
   * The address of the pool where the deposit is executed.
   */
  poolAddress: Address;

  /**
   * The allocations for each asset in the pool.
   * If you do not wish to deposit a certain asset, set its value to `0`.
   * Make sure that poolAllocations is sorted and normalized.
   */
  poolAllocations: Allocation[];

  /**
   * Optional configuration for the deposit transaction, including minimum LP tokens, recipient address, and more.
   */
  config?: DepositConfig | null;

  /**
   * The next operation in the transaction sequence, which may be directed to another pool.
   * This field allows for nested operations in a deposit process.
   */
  next?: SwapNext | DepositNext | null;
};

/**
 * Configuration for a swap transaction.
 */
type SwapConfig = {
  /**
   * The deadline in unix timestamp. If the transaction reaches the vault contract after this deadline, it will be refunded.
   */
  deadline?: bigint | null;

  /**
   * The minimum expected amount of AssetOut to receive.
   */
  minAmountOut?: bigint | null;

  /**
   * The address to receive the AssetOut. If set to null, it defaults to the initiator of the swap transaction.
   */
  recipient?: Address | null;

  /**
   * The signed relative price, used only in yield-bearing stable pools and meta pools.
   */
  signedRate?: SignedRate | null;

  /**
   * The calldata to be called upon successful transaction completion.
   */
  fulfillPayload?: Cell | null;

  /**
   * The calldata returned to the transaction initiator upon transaction failure.
   */
  rejectPayload?: Cell | null;

  /**
   * Extra payload for the swap operation. used for referral program
   */
  extraPayload?: Dictionary<bigint, Cell> | null;
};

/**
 * Payload for a swap transaction.
 */
export type SwapPayload = {
  /**
   * The unique identifier for the query.
   */
  queryId: bigint;

  /**
   * The address of the pool where the swap is executed.
   */
  poolAddress: Address;

  /**
   * The asset being provided for the swap.
   */
  assetIn: Asset;

  /**
   * The amount of the input asset being swapped.
   */
  amountIn: bigint;

  /**
   * The asset expected to be received from the swap.
   */
  assetOut: Asset;

  /**
   * Optional configuration for the swap transaction, including deadline, minimum output amount, and more.
   */
  config?: SwapConfig | null;

  /**
   * The next operation in the swap sequence, which may be directed to another pool.
   * This field allows for nested operations in a swap process.
   */
  next?: SwapNext | WithdrawNext | null;
};

/**
 * Configuration for a single asset withdrawal transaction.
 */
type SingleWithdrawConfig = {
  /**
   * The withdrawal mode, fixed to 'Single' for single asset withdrawals.
   */
  mode: 'Single';

  /**
   * The asset expected to be received from the withdrawal. (only return one asset)
   */
  assetOut: Asset;

  /**
   * The minimum amount of the single asset expected to receive from the withdrawal.
   * Transactions that yield less than this amount will fail.
   */
  minAmountOut?: bigint | null;
};

/**
 * Configuration for a balanced withdrawal transaction.
 */
type BalancedWithdrawConfig = {
  /**
   * The withdrawal mode, fixed to 'Balanced' for proportional withdrawals across all assets in the pool.
   */
  mode: 'Balanced';

  /**
   * The minimum amounts of each asset expected to receive from the withdrawal.
   * Transactions that yield less than these amounts will fail.
   * Please ensure that minAmountOut is normalized according to the pool assets before passing it in.
   */
  minAmountOuts?: Allocation[] | null;
};

/**
 * Payload for a withdrawal transaction.
 */
export type WithdrawPayload = {
  /**
   * The unique identifier for the query.
   */
  queryId: bigint;

  /**
   * The address of the pool where the withdrawal is executed.
   */
  poolAddress: Address;

  /**
   * The amount of LP tokens to burn for the withdrawal.
   */
  burnLpAmount: bigint;

  /**
   * The address to receive the withdrawn assets.
   * Defaults to the initiator of the withdrawal transaction if set to null.
   */
  recipient?: Address | null;

  /**
   * The signed relative price, used for price-sensitive balanced withdrawals.
   * Ensure this value is securely generated and verified to prevent exploits.
   */
  signedRate?: SignedRate | null;

  /**
   * Reserved for future use. Currently unsupported extra payload.
   */
  extraPayload?: Dictionary<bigint, Cell> | null;

  /**
   * Optional configuration for the withdrawal transaction, defining the mode and other parameters.
   * default to balanced withdraw if not provided
   */
  config?: SingleWithdrawConfig | BalancedWithdrawConfig | null;

  /**
   * The next operation in the transaction sequence.
   * This field allows for nested operations in a withdrawal process.
   */
  next?: WithdrawNext | null;
};

/**
 * Configuration for the next operation in a transaction sequence, representing a deposit into another pool.
 */
export type DepositNext = {
  /**
   * The type of the next operation, fixed to 'Deposit'.
   */
  type: 'Deposit';

  /**
   * The address of the next pool where the deposit will occur.
   */
  nextPoolAddress: Address;

  /**
   * The allocation for the meta asset in the next pool.
   * If you do not wish to deposit meta asset, set its value to `0`.
   */
  metaAllocation: Allocation;

  /**
   * The minimum amount of LP tokens expected to receive from the next deposit operation.
   * If not provided, defaults to no minimum.
   */
  minLpAmount?: bigint | null;
};

/**
 * Configuration for the next operation in a transaction sequence, representing a swap in another pool.
 */
export type SwapNext = {
  /**
   * The type of the next operation, fixed to 'Swap'.
   */
  type: 'Swap';

  /**
   * The address of the next pool where the swap will occur.
   */
  nextPoolAddress: Address;

  /**
   * The asset expected to be received from the next swap operation.
   */
  assetOut: Asset;

  /**
   * The minimum amount of the asset expected to be received from the next swap operation.
   * Transactions yielding less than this amount will fail.
   */
  minAmountOut?: bigint | null;

  /**
   * Extra payload for the swap operation. used for referral program
   */
  extraPayload?: Dictionary<bigint, Cell> | null;

  /**
   * The next operation in the sequence, allowing for nested transaction flows.
   */
  next?: SwapNext | WithdrawNext | null;
};

/**
 * Configuration for the next operation in a transaction sequence, representing a withdrawal from another pool.
 */
export type WithdrawNext = {
  /**
   * The type of the next operation, fixed to 'Withdraw'.
   */
  type: 'Withdraw';

  /**
   * The address of the next pool where the withdrawal will occur.
   */
  nextPoolAddress: Address;

  /**
   * Configuration for the withdrawal operation, defining parameters such as the mode and minimum expected amounts.
   * The `signedRate` and `extraPayload` fields are omitted as they are not required for this step.
   */
  config?:
    | Omit<SingleWithdrawConfig, 'signedRate' | 'extraPayload'>
    | Omit<BalancedWithdrawConfig, 'signedRate' | 'extraPayload'>
    | null;
};
