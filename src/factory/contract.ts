import { Address, beginCell, Builder, Contract, ContractProvider, Dictionary, SenderArguments } from '@ton/core';
import { ContractType, NextType, Op, Size } from '../common';
import { FactoryData } from './storage';
import { Allocation, coinsMarshaller, SignedRate, storeCoinsNested } from '@torch-finance/core';
import { DepositNext, DepositPayload, SwapNext, SwapPayload, WithdrawNext, WithdrawPayload } from './type';

export class Factory implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Factory(address);
  }

  private packMinAmount(minAmountOut: Allocation[] | Allocation) {
    // withdraw balance in all assets
    if (Array.isArray(minAmountOut)) {
      return storeCoinsNested(minAmountOut.map((alloc) => alloc.value));
    }
    // if only one asset is non-zero, it is the asset out
    return beginCell().storeCoins(minAmountOut.value).endCell();
  }

  private storeSwapNext(src: SwapNext) {
    const nextCell = src.next ? beginCell().store(this.storeNext(src.next)).endCell() : null;
    return (b: Builder) => {
      b.storeUint(NextType.Swap, Size.NextType)
        .storeAddress(src.nextPoolAddress)
        .storeRef(src.assetOut.toCell())
        .storeCoins(src.minAmountOut ?? 0)
        .storeMaybeRef(nextCell);
    };
  }

  private storeDepositNext(src: DepositNext) {
    return (b: Builder) => {
      b.storeUint(NextType.Deposit, Size.NextType)
        .storeAddress(src.nextPoolAddress)
        .storeCoins(src.metaAmount ?? 0)
        .storeRef(src.metaAsset.toCell())
        .storeCoins(src.minLpAmount ?? 0)
        .endCell();
    };
  }

  private storeWithdrawNext(src: WithdrawNext) {
    const assetOut = src.config?.mode === 'single' ? src.config.assetOut.toCell() : null;
    const minAmountOut = src.config?.minAmountOut ? this.packMinAmount(src.config.minAmountOut) : null;
    return (b: Builder) => {
      b.storeUint(NextType.Withdraw, Size.NextType)
        .storeAddress(src.nextPoolAddress)
        .storeMaybeRef(assetOut)
        .storeMaybeRef(minAmountOut)
        .endCell();
    };
  }

  private storeNext(src: SwapNext | DepositNext | WithdrawNext) {
    return (b: Builder) => {
      if (src.type === 'swap') {
        return b.store(this.storeSwapNext(src));
      }
      if (src.type === 'deposit') {
        return b.store(this.storeDepositNext(src));
      }
      if (src.type === 'withdraw') {
        return b.store(this.storeWithdrawNext(src));
      }
    };
  }

  private storeSwap(src: SwapPayload) {
    const defaultDeadline = BigInt(Math.floor(Date.now() / 1000) + 10 * 60); // 10 minutes
    const nextCell = src.next ? beginCell().store(this.storeNext(src.next)).endCell() : null;
    return (b: Builder) => {
      b.storeUint(Op.Vault.Swap, Size.Op)
        .storeAddress(src.poolAddress)
        .storeRef(src.assetOut.toCell())
        .storeUint(src?.config?.deadline ?? defaultDeadline, Size.Timestamp)
        .storeMaybeRef()
        .storeMaybeRef(nextCell)
        .endCell();
    };
  }

  private storeDeposit(payload: DepositPayload) {}

  private storeWithdraw(payload: WithdrawPayload) {}

  private storeSignedRate(src: SignedRate) {
    return (b: Builder) => {
      b.storeBuffer(src.signature, Size.Signature)
        .storeRef(src.payload.toCell())
        .storeMaybeRef(
          src.nextSignedRate ? beginCell().store(this.storeSignedRate(src.nextSignedRate)).endCell() : null,
        )
        .endCell();
    };
  }

  async getSwapPayload(provider: ContractProvider, sender: Address, payload: SwapPayload) {}

  async getDepositPayload(
    provider: ContractProvider,
    sender: Address,
    payload: DepositPayload,
  ): Promise<SenderArguments> {}

  async getWithdrawPayload(
    provider: ContractProvider,
    sender: Address,
    payload: WithdrawPayload,
  ): Promise<SenderArguments> {}

  async getFactoryData(provider: ContractProvider): Promise<FactoryData> {
    const data = await provider.get('get_factory_data', []);
    const contractType = data.stack.readNumber() as ContractType;
    const admin = data.stack.readAddress();
    const baseCode = data.stack.readCell();
    const lpAccountCode = data.stack.readCell();

    const vaultCodesSc = data.stack.readCell().beginParse();
    const vaultCodes = vaultCodesSc.loadDictDirect(Dictionary.Keys.BigUint(4), Dictionary.Values.Cell());

    const signerKeyInt = data.stack.readBigNumber();
    const signerKey = Buffer.from(signerKeyInt.toString(16), 'hex');

    const poolCodesSc = data.stack.readCell().beginParse();
    const poolCodes = poolCodesSc.loadDictDirect(Dictionary.Keys.BigUint(4), Dictionary.Values.Cell());

    const lpWalletCode = data.stack.readCell();

    const adminFeeConfigSc = data.stack.readCell().beginParse();
    const adminFeeConfig = adminFeeConfigSc.loadDictDirect(Dictionary.Keys.BigUint(4), coinsMarshaller());

    return {
      contractType,
      admin,
      baseCode,
      lpAccountCode,
      vaultCodes,
      signerKey,
      poolCodes,
      lpWalletCode,
      adminFeeConfig,
    };
  }
}
