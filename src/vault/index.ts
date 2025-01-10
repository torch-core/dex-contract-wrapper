import { Address, Contract, ContractProvider } from '@ton/core';
import { AssetType } from '@torch-finance/core';
export type TonVaultData = {
  assetType: AssetType;
  admin: Address;
};

export type JettonVaultData = {
  assetType: AssetType;
  admin: Address;
  jettonMaster: Address;
  jettonWallet: Address;
};

export class Vault implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Vault(address);
  }

  async getVaultData(provider: ContractProvider): Promise<TonVaultData | JettonVaultData> {
    const res = await provider.get('get_vault_data', []);
    const sc = res.stack.readCell().beginParse();
    const assetType = sc.loadUint(4) as AssetType;
    const admin = sc.loadAddress(); // admin address

    switch (assetType) {
      case AssetType.TON:
        return { assetType, admin } as TonVaultData;
      case AssetType.JETTON: {
        const jettonMaster = sc.loadAddress();
        const jettonWallet = sc.loadAddress();
        return {
          assetType,
          admin,
          jettonMaster,
          jettonWallet,
        } as JettonVaultData;
      }
      case AssetType.EXTRA_CURRENCY: {
        throw new Error('ExtraCurrency is not supported');
      }
    }
  }
}
