import { Address, beginCell, Contract, ContractProvider, toNano } from '@ton/core';
import { Allocation, Asset, parseAssetsFromNestedCell, parseCoinsFromNestedCell } from '@torch-finance/core';
import { LpAccountData } from './storage';
import { Op, Size } from '../common';

export class LpAccount implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new LpAccount(address);
  }

  async getCancelDepositPayload(provider: ContractProvider, depositedAssetCount: number, queryId: bigint = 8n) {
    return {
      to: this.address,
      value: toNano('0.15') * BigInt(depositedAssetCount),
      body: beginCell().storeUint(Op.LpAccount.CancelDeposit, Size.Op).storeUint(queryId, Size.QueryId).endCell(),
    };
  }

  async getLpAccountData(provider: ContractProvider): Promise<LpAccountData> {
    const res = await provider.get('get_lp_account_data', []);
    const contractType = res.stack.readBigNumber();
    const admin = res.stack.readAddress();
    const queryId = res.stack.readBigNumber();
    const providerAddress = res.stack.readAddress();
    const poolAddress = res.stack.readAddress();
    const metaAsset = Asset.fromCell(res.stack.readCell());
    const metaAmount = res.stack.readBigNumber();
    const metaBalance = res.stack.readBigNumber();
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
      metaAsset,
      metaAmount,
      metaBalance,
      assets,
      currentBalances,
      targetBalances,
      baseCode,
      factory,
    };
  }
}
