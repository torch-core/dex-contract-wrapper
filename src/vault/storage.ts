import { Address } from '@ton/core';
import { AssetType } from '@torch-finance/core';

export type TonVaultData = {
  assetType: AssetType;
  admin: Address;
};

export type JettonVaultData = TonVaultData & {
  jettonMaster: Address;
  jettonWallet: Address;
};
