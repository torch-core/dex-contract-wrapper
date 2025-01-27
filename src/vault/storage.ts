import { Address } from '@ton/core';
import { AssetType } from '@torch-finance/core';
import { ContractType } from '../common';

export type TonVaultData = {
  contractType: ContractType;
  assetType: AssetType;
  admin: Address;
};

export type JettonVaultData = TonVaultData & {
  contractType: ContractType;
  assetType: AssetType;
  admin: Address;
  jettonMaster: Address;
  jettonWallet: Address;
};
