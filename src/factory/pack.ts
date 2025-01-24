import { Address, beginCell, contractAddress } from '@ton/core';
import { Allocation, Asset, storeCoinsNested } from '@torch-finance/core';
import { BaseContract, ContractType, Size } from '../common';

export const packMinAmount = (minAmountOut: Allocation[] | bigint) => {
  // withdraw balance in all assets
  if (Array.isArray(minAmountOut)) {
    // Please ensure that minAmountOut is normalized according to the pool assets before passing it in.
    return storeCoinsNested(minAmountOut.map((alloc) => alloc.value));
  }
  // if only one asset is non-zero, it is the asset out
  return beginCell().storeCoins(minAmountOut).endCell();
};

export const getVaultProof = (asset: Asset) => {
  return BigInt(
    `0x${beginCell().storeUint(ContractType.vault, 5).storeRef(asset.toCell()).endCell().hash().toString('hex')}`,
  );
};

function getBaseInit(deployer: Address, proof: bigint) {
  return beginCell().storeAddress(deployer).storeUint(proof, Size.Proof).endCell();
}

export function getVaultAddress(factoryAddress: Address, asset: Asset) {
  const basechain = 0;
  const vaultProof = getVaultProof(asset);
  const baseContractInit = getBaseInit(factoryAddress, vaultProof);
  const baseContractAddress = contractAddress(basechain, {
    code: BaseContract.code,
    data: baseContractInit,
  });
  return baseContractAddress;
}
