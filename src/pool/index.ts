import { Address, ContractProvider, Contract } from '@ton/core';
import { beginCell } from '@ton/core';
import { Allocation, Asset, parseAssetsFromNestedCell, storeCoinsNested } from '@torch-finance/core';
import { parsePool, PoolData } from './storage';

export class Pool implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Pool(address);
  }

  // Get ordered assets in this pool
  async getAssets(provider: ContractProvider): Promise<Asset[]> {
    const res = await provider.get('get_assets', []);
    const cell = res.stack.readCell();
    return parseAssetsFromNestedCell(cell);
  }

  // Get lp token jetton wallet address for owner
  async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
    const res = await provider.get('get_wallet_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(owner).endCell(),
      },
    ]);
    return res.stack.readAddress();
  }

  // Get pool data
  async getPoolData(provider: ContractProvider): Promise<PoolData> {
    const res = await provider.get('get_pool_data', []);
    const sc = res.stack.readCell().beginParse();
    return parsePool(sc);
  }

  // Get virtual price of the pool
  async getVirtualPrice(provider: ContractProvider, rates?: Allocation[]): Promise<bigint> {
    const vp = await provider.get('get_virtual_price', [
      rates
        ? {
            type: 'cell',
            cell: storeCoinsNested(rates.map((rate) => rate.amount)),
          }
        : {
            type: 'null',
          },
    ]);

    const virtualPrice = vp.stack.readBigNumber();

    return virtualPrice;
  }
}
