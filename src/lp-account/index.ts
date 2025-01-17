import { Address, Cell, Contract, ContractProvider } from '@ton/core';
import { Allocation, Asset, parseAssetsFromNestedCell, parseCoinsFromNestedCell } from '@torch-finance/core';

export type LpAccountData = {
  contractType: bigint;
  admin: Address;
  queryId: bigint;
  providerAddress: Address;
  poolAddress: Address;
  metaAmount: bigint;
  assets: Asset[];
  currentBalances: Allocation[];
  targetBalances: Allocation[];
  baseCode: Cell;
  factory: Address;
};

export class LpAccount implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new LpAccount(address);
  }

  async getLpAccountData(provider: ContractProvider): Promise<LpAccountData> {
    const res = await provider.get('get_lp_account_data', []);
    const contractType = res.stack.readBigNumber();
    const admin = res.stack.readAddress();
    const queryId = res.stack.readBigNumber();
    const providerAddress = res.stack.readAddress();
    const poolAddress = res.stack.readAddress();
    const metaAmount = res.stack.readBigNumber();
    const assets = parseAssetsFromNestedCell(res.stack.readCell());
    const currentBalancesCell = parseCoinsFromNestedCell(res.stack.readCell());
    const targetBalancesCell = parseCoinsFromNestedCell(res.stack.readCell());
    const currentBalances = Allocation.createAllocations(
      assets.map((asset, index) => ({ asset, value: currentBalancesCell[index] })),
    );
    const targetBalances = Allocation.createAllocations(
      assets.map((asset, index) => ({ asset, value: targetBalancesCell[index] })),
    );
    const baseCode = res.stack.readCell();
    const factory = res.stack.readAddress();

    return {
      contractType,
      admin,
      queryId,
      providerAddress,
      poolAddress,
      metaAmount,
      assets,
      currentBalances,
      targetBalances,
      baseCode,
      factory,
    };
  }
}
