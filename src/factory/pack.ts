import { beginCell } from '@ton/core';
import { Allocation, Asset, storeCoinsNested } from '@torch-finance/core';
import { ContractType } from '../common';

export const getVaultProof = (asset: Asset) => {
  return BigInt(
    `0x${beginCell().storeUint(ContractType.vault, 5).storeRef(asset.toCell()).endCell().hash().toString('hex')}`,
  );
};

export const packMinAmount = (minAmountOut: Allocation[] | bigint) => {
  // withdraw balance in all assets
  if (Array.isArray(minAmountOut)) {
    // Please ensure that minAmountOut is normalized according to the pool assets before passing it in.
    return storeCoinsNested(minAmountOut.map((alloc) => alloc.value));
  }
  // if only one asset is non-zero, it is the asset out
  return beginCell().storeCoins(minAmountOut).endCell();
};
