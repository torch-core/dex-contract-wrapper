import { Address, beginCell, Builder, Cell, Contract, ContractProvider, Dictionary, SenderArguments } from '@ton/core';
import { JettonMaster } from '@ton/ton';
import { ContractType, NextType, Op, Size } from '../common';
import { FactoryData } from './storage';
import {
  Asset,
  AssetType,
  coinsMarshaller,
  SignedRate,
  storeCoinsNested,
  storeSortedAssetsNested,
} from '@torch-finance/core';
import { DepositNext, DepositPayload, SwapNext, SwapPayload, WithdrawNext, WithdrawPayload } from './type';
import { getVaultAddress, packMinAmount } from './pack';
import { Gas, GasCalculator, NumTxs } from './gas';
import { countNextDepth } from './next';

export class Factory implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Factory(address);
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
        .storeCoins(src.metaAllocation.value)
        .storeRef(src.metaAllocation.asset.toCell())
        .storeCoins(src.minLpAmount ?? 0)
        .endCell();
    };
  }

  private storeWithdrawNext(src: WithdrawNext) {
    const assetOut = src.config?.mode === 'Single' ? src.config.assetOut.toCell() : null;
    let minAmountOut: Cell | null = null;
    if (src.config?.mode === 'Balanced' && src.config.minAmountOuts) {
      minAmountOut = packMinAmount(src.config.minAmountOuts);
    }

    if (src.config?.mode === 'Single' && src.config.minAmountOut) {
      minAmountOut = packMinAmount(src.config.minAmountOut);
    }
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
      if (src.type === 'Swap') {
        return b.store(this.storeSwapNext(src));
      }
      if (src.type === 'Deposit') {
        return b.store(this.storeDepositNext(src));
      }
      if (src.type === 'Withdraw') {
        return b.store(this.storeWithdrawNext(src));
      }
    };
  }

  private storeSwap(payload: SwapPayload) {
    // Prepare deadline time. If blockchain time > deadline, then vault will refund
    const defaultDeadline = BigInt(Math.floor(Date.now() / 1000) + 10 * 60); // 10 minutes
    const deadline = payload.config?.deadline ?? defaultDeadline;

    // Prepare signed rate if pool needs it
    const signedRateCell = payload.config?.signedRate
      ? beginCell().store(this.storeSignedRate(payload.config.signedRate)).endCell()
      : null;

    // Prepare swap config if it exists
    const swapConfigCell = payload.config
      ? beginCell()
          .storeCoins(payload.config.minAmountOut ?? 0)
          .storeAddress(payload.config.recipient)
          .storeMaybeRef(signedRateCell)
          .storeMaybeRef(payload.config.fulfillPayload)
          .storeMaybeRef(payload.config.rejectPayload)
          .storeDict(payload.config.extraPayload)
          .endCell()
      : null;

    // Prepare next operation if it exists (swap or withdraw)
    const nextCell = payload.next ? beginCell().store(this.storeNext(payload.next)).endCell() : null;

    return (builder: Builder) => {
      builder
        .storeUint(Op.Vault.Swap, Size.Op)
        .storeAddress(payload.poolAddress)
        .storeRef(payload.assetOut.toCell())
        .storeUint(deadline, Size.Timestamp)
        .storeMaybeRef(swapConfigCell)
        .storeMaybeRef(nextCell)
        .endCell();
    };
  }

  private storeDeposit(payload: DepositPayload) {
    // Prepare target cell for deposit in the pool
    const targetCell = storeCoinsNested(payload.poolAllocations.map((alloc) => alloc.value));

    // Prepare assets cell for deposit. Only when deposit one
    // There are three scenarios where only one asset will be wrapped for deposit:
    // 1. depositAmounts contains only one asset, and there is no next.
    // 2. depositAmounts contains only one asset, there is a next, but the meta amount in next is 0.
    // 3. depositAmounts contains only one asset, there is a next, and the next type is swap.
    let assetsCell: Cell | null = null;
    const isDepositOne = payload.poolAllocations.filter((alloc) => alloc.value > 0).length === 1;
    if (
      isDepositOne &&
      (!payload.next ||
        (payload.next &&
          (payload.next.type === 'Swap' || (payload.next.type === 'Deposit' && !payload.next?.metaAllocation.value))))
    ) {
      // Deposit only one asset
      assetsCell = beginCell().storeRef(payload.poolAllocations[0].asset.toCell()).endCell();
    } else {
      // Deposit multiple assets
      assetsCell = storeSortedAssetsNested(payload.poolAllocations.map((alloc) => alloc.asset));
    }

    // Prepare signed rate if pool needs it
    const signedRateCell = payload.config?.signedRate
      ? beginCell().store(this.storeSignedRate(payload.config.signedRate)).endCell()
      : null;

    // Prepare deposit config if it exists
    const configCell = payload.config
      ? beginCell()
          .storeCoins(payload.config.minLpAmount ?? 0)
          .storeAddress(payload.config.recipient)
          .storeMaybeRef(signedRateCell)
          .storeMaybeRef(payload.config.fulfillPayload)
          .storeMaybeRef(payload.config.rejectPayload)
          .storeDict(payload.config.extraPayload)
          .endCell()
      : null;

    // Prepare next operation if it exists (swap or deposit)
    const nextCell = payload.next ? beginCell().store(this.storeNext(payload.next)).endCell() : null;

    return (builder: Builder) => {
      builder
        .storeUint(Op.Vault.Deposit, Size.Op)
        .storeAddress(payload.poolAddress)
        .storeRef(assetsCell)
        .storeRef(targetCell)
        .storeMaybeRef(configCell)
        .storeMaybeRef(nextCell)
        .endCell();
    };
  }

  private storeWithdraw(payload: WithdrawPayload) {
    // Handle withdraw config base on the mode
    // Default is withdraw balanced if not provided
    let assetOut: Cell | null = null;

    // If it is single withdraw mode, set assetOut
    if (payload.config?.mode === 'Single') {
      assetOut = payload.config.assetOut.toCell();
    }

    // Prepare signed rate if pool needs it
    const signedRateCell = payload.signedRate
      ? beginCell().store(this.storeSignedRate(payload.signedRate)).endCell()
      : null;

    // Prepare min amount out for the first pool if it exists
    let minAmountOut: Cell | null = null;
    if (payload.config?.mode === 'Balanced' && payload.config.minAmountOuts) {
      minAmountOut = packMinAmount(payload.config.minAmountOuts);
    }

    if (payload.config?.mode === 'Single' && payload.config.minAmountOut) {
      minAmountOut = packMinAmount(payload.config.minAmountOut);
    }

    // Prepare next operation if it exists (withdraw)
    const nextCell = payload.next ? beginCell().store(this.storeNext(payload.next)).endCell() : null;

    return (builder: Builder) => {
      builder
        .storeUint(Op.Vault.Withdraw, Size.Op)
        .storeAddress(payload.recipient)
        .storeMaybeRef(signedRateCell)
        .storeMaybeRef(assetOut)
        .storeMaybeRef(beginCell().storeMaybeRef(minAmountOut).storeDict(payload.extraPayload).endCell())
        .storeMaybeRef(nextCell)
        .endCell();
    };
  }

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

  async getSwapPayload(provider: ContractProvider, sender: Address, payload: SwapPayload): Promise<SenderArguments> {
    // Get vault address
    const vaultAddress = getVaultAddress(this.address, payload.assetIn);

    // Get counts of next operations
    const nextDepth = payload.next ? countNextDepth(payload.next) : 0n;

    // Compute the gas for the swap
    const swapGas =
      Gas.SWAP_GAS + // Swap gas in the first pool
      (payload.next ? Gas.SWAP_NEXT_GAS * (nextDepth - 1n) + Gas.WITHDRAW_NEXT_GAS : 0n) + // If swap has next, it will use WITHDRAW_NEXT_GAS to over-estimate the gas
      GasCalculator.computeForwardFees(
        NumTxs.Swap + nextDepth, // Swap transactions + next operations
        payload.config?.fulfillPayload,
        payload.config?.rejectPayload,
      ); // Compute forward fees base on the size of the forward payload

    switch (payload.assetIn.type) {
      case AssetType.TON: {
        return {
          to: vaultAddress,
          value: payload.amountIn + swapGas,
          body: beginCell()
            .storeUint(Op.Vault.Swap, Size.Op)
            .storeUint(payload.queryId, Size.QueryId)
            .storeCoins(payload.amountIn)
            .storeRef(beginCell().store(this.storeSwap(payload)).endCell())
            .endCell(),
        };
      }
      case AssetType.JETTON: {
        const jettonMaster = provider.open(JettonMaster.create(payload.assetIn.jettonMaster as Address));
        const senderJettonWallet = await jettonMaster.getWalletAddress(sender);
        const forwardPayload = beginCell().store(this.storeSwap(payload)).endCell();
        return {
          to: senderJettonWallet,
          value: swapGas + Gas.JETTON_TRANSFER_GAS,
          body: beginCell()
            .storeUint(Op.Jetton.Transfer, Size.Op)
            .storeUint(payload.queryId, Size.QueryId)
            .storeCoins(payload.amountIn)
            .storeAddress(vaultAddress) // destination is the vault
            .storeAddress(sender) // response destination address is the sender
            .storeMaybeRef(null) // customPayload is null for now
            .storeCoins(swapGas) // Forward TON
            .storeMaybeRef(forwardPayload)
            .endCell(),
        };
      }
      case AssetType.EXTRA_CURRENCY:
        throw new Error('Extra currency is not supported');
    }
  }

  async getDepositPayload(
    provider: ContractProvider,
    sender: Address,
    payload: DepositPayload,
  ): Promise<SenderArguments[]> {
    // Get counts of next operations
    const nextDepth = payload.next ? 1n : 0n;

    // Compute the gas for the deposit
    const depositGas =
      Gas.DEPOSIT_GAS + // Deposit gas in the first pool
      nextDepth * Gas.DEPOSIT_NEXT_GAS + // If there is a next operation (swap or deposit), add DEPOSIT_NEXT_GAS (0.1 TON) for the next operation
      GasCalculator.computeForwardFees(
        NumTxs.Deposit + nextDepth, // Deposit transactions + next operations
        payload.config?.fulfillPayload,
        payload.config?.rejectPayload,
      ); // Compute forward fees base on the size of the forward payload

    // Create sendArgs for each deposit
    const allAllocations =
      payload.next && payload.next.type === 'Deposit'
        ? [...payload.poolAllocations, payload.next.metaAllocation]
        : payload.poolAllocations;

    const senderArgsPromises = allAllocations.map(async ({ asset, value }) => {
      if (value === 0n) return null;
      switch (asset.type) {
        case AssetType.TON: {
          const tonVaultAddress = getVaultAddress(this.address, asset);
          return {
            to: tonVaultAddress,
            value: value + depositGas,
            body: beginCell()
              .storeUint(Op.Vault.Deposit, Size.Op)
              .storeUint(payload.queryId, Size.QueryId)
              .storeCoins(value) // Deposit TON amount
              .storeRef(beginCell().store(this.storeDeposit(payload)).endCell())
              .endCell(),
          };
        }
        case AssetType.JETTON: {
          const jettonVault = getVaultAddress(this.address, asset);
          const jettonMaster = provider.open(JettonMaster.create(asset.jettonMaster as Address));
          const senderJettonWallet = await jettonMaster.getWalletAddress(sender);
          const forwardPayload = beginCell().store(this.storeDeposit(payload)).endCell();
          return {
            to: senderJettonWallet,
            value: depositGas + Gas.JETTON_TRANSFER_GAS,
            body: beginCell()
              .storeUint(Op.Jetton.Transfer, Size.Op)
              .storeUint(payload.queryId, Size.QueryId)
              .storeCoins(value) // deposit gas + forward ton gas
              .storeAddress(jettonVault) // destination is the jetton vault
              .storeAddress(sender) // response destination address is the sender
              .storeMaybeRef(null) // customPayload is null for now
              .storeCoins(depositGas) // Forward TON
              .storeMaybeRef(forwardPayload)
              .endCell(),
          };
        }
        case AssetType.EXTRA_CURRENCY:
          // pack extra currency asset
          throw new Error('Extra currency is not supported');
      }
    });

    const senderArgs = (await Promise.all(senderArgsPromises)).filter((arg) => arg !== null);
    return senderArgs;
  }

  async getWithdrawPayload(
    provider: ContractProvider,
    sender: Address,
    payload: WithdrawPayload,
  ): Promise<SenderArguments> {
    // Get lp vault address
    const lpAsset = Asset.jetton(payload.poolAddress);
    const lpVaultAddress = getVaultAddress(this.address, lpAsset);

    // Compute the gas for the withdraw
    const withdrawGas = Gas.WITHDRAW_GAS + (payload.next ? Gas.WITHDRAW_NEXT_GAS : 0n);

    // Get sender lp wallet address
    const jettonMaster = provider.open(JettonMaster.create(payload.poolAddress));
    const senderJettonWallet = await jettonMaster.getWalletAddress(sender);
    const forwardPayload = beginCell().store(this.storeWithdraw(payload)).endCell();

    return {
      to: senderJettonWallet,
      value: withdrawGas + Gas.JETTON_TRANSFER_GAS,
      body: beginCell()
        .storeUint(Op.Jetton.Transfer, Size.Op)
        .storeUint(payload.queryId, Size.QueryId)
        .storeCoins(payload.burnLpAmount)
        .storeAddress(lpVaultAddress) // destination is the lp vault
        .storeAddress(sender) // response destination address is the sender
        .storeMaybeRef(null) // customPayload is null for now
        .storeCoins(withdrawGas) // Forward TON
        .storeMaybeRef(forwardPayload)
        .endCell(),
    };
  }

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

  // Get contract address from proof
  async getAddress(provider: ContractProvider, proof: bigint): Promise<Address> {
    const res = await provider.get('get_address', [
      {
        type: 'int',
        value: proof,
      },
    ]);
    return res.stack.readAddress();
  }
}
