import { Address, ContractProvider, Contract } from '@ton/core';
import { beginCell } from '@ton/core';
import { Allocation, Asset, parseAssetsFromNestedCell, storeCoinsNested } from '@torch-finance/core';
import { parsePool, PoolData } from './storage';
import {
  SimulateDepositParams,
  SimulateSwapParams,
  SimulateWithdrawParams,
  SimulateWithdrawResult,
  SimulatorDepositResult,
  SimulatorSwapResult,
} from './simulate';

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
            cell: storeCoinsNested(rates.map((rate) => rate.value)),
          }
        : {
            type: 'null',
          },
    ]);

    const virtualPrice = vp.stack.readBigNumber();

    return virtualPrice;
  }

  // Simulate
  async simulateDeposit(provider: ContractProvider, params: SimulateDepositParams): Promise<SimulatorDepositResult> {
    const simulateDepositResult = await provider.get('simulate_deposit', [
      {
        type: 'cell',
        cell: storeCoinsNested(params.depositAmounts.map((amount) => amount.value)),
      },
      params.rates
        ? {
            type: 'cell',
            cell: storeCoinsNested(params.rates.map((rate) => rate.value)),
          }
        : {
            type: 'null',
          },
    ]);

    const lpTokenOut = simulateDepositResult.stack.readBigNumber();
    const virtualPriceBefore = simulateDepositResult.stack.readBigNumber();
    const virtualPriceAfter = simulateDepositResult.stack.readBigNumber();
    const lpTotalSupply = simulateDepositResult.stack.readBigNumber();

    return { lpTokenOut, virtualPriceBefore, virtualPriceAfter, lpTotalSupply };
  }

  async getSimulateSwap(provider: ContractProvider, params: SimulateSwapParams): Promise<SimulatorSwapResult> {
    const simulateSwapResult = await provider.get('get_simulate_swap', [
      {
        type: 'cell',
        cell: params.assetIn.toCell(),
      },
      {
        type: 'cell',
        cell: params.assetOut.toCell(),
      },
      {
        type: 'int',
        value: params.amount,
      },
      params.rates
        ? {
            type: 'cell',
            cell: storeCoinsNested(params.rates.map((rate) => rate.value)),
          }
        : {
            type: 'null',
          },
    ]);

    const amountOut = simulateSwapResult.stack.readBigNumber();
    const virtualPriceBefore = simulateSwapResult.stack.readBigNumber();
    const virtualPriceAfter = simulateSwapResult.stack.readBigNumber();
    return {
      amountOut,
      virtualPriceBefore,
      virtualPriceAfter,
    };
  }

  async getSimulateWithdraw(
    provider: ContractProvider,
    params: SimulateWithdrawParams,
  ): Promise<SimulateWithdrawResult> {
    const simulateWithdrawResult = await provider.get('get_simulate_withdraw', [
      {
        type: 'int',
        value: params.lpAmount,
      },
      {
        type: 'cell',
        cell: beginCell()
          .storeMaybeRef(params.assetOut?.toCell() ?? null)
          .endCell(),
      },
      params.rates
        ? {
            type: 'cell',
            cell: storeCoinsNested(params.rates.map((rate) => rate.value)),
          }
        : {
            type: 'null',
          },
    ]);
    const amountOutsTuple = simulateWithdrawResult.stack.readTuple();

    const amountOuts = [];
    while (amountOutsTuple.remaining > 0) {
      amountOuts.push(amountOutsTuple.readBigNumber());
    }
    const virtualPriceBefore = simulateWithdrawResult.stack.readBigNumber();
    const virtualPriceAfter = simulateWithdrawResult.stack.readBigNumber();

    return {
      amountOuts,
      virtualPriceBefore,
      virtualPriceAfter,
    };
  }
}
