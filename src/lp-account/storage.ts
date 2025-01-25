import { Address, Cell } from '@ton/core';
import { Asset, Allocation } from '@torch-finance/core';

export type LpAccountData = {
  contractType: bigint;
  admin: Address;
  queryId: bigint;
  providerAddress: Address;
  poolAddress: Address;
  metaAsset: Asset;
  metaAmount: bigint;
  metaBalance: bigint;
  assets: Asset[];
  currentBalances: Allocation[];
  targetBalances: Allocation[];
  baseCode: Cell;
  factory: Address;
};
