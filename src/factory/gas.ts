import { Cell, toNano } from '@ton/core';
import { computeMessageForwardFees, MsgPrices } from '@ton/ton';

export abstract class NumTxs {
  // It takes 7 txs to complete a swap
  static readonly Swap = 7n;
  // It takes 9 txs to complete a deposit
  static readonly Deposit = 9n;
}

export abstract class Gas {
  static readonly JETTON_TRANSFER_GAS = toNano('0.05');
  static readonly DEPOSIT_GAS = toNano('0.2');
  static readonly SWAP_GAS = toNano('0.18');
  static readonly WITHDRAW_GAS = toNano('0.4');
  static readonly DEPOSIT_NEXT_GAS = toNano('0.1');
  static readonly SWAP_NEXT_GAS = toNano('0.1');
  static readonly WITHDRAW_NEXT_GAS = toNano('0.35');
}

export class GasCalculator {
  private static config: MsgPrices = {
    lumpPrice: 400000n,
    bitPrice: 26214400n,
    cellPrice: 2621440000n,
    ihrPriceFactor: 98304,
    firstFrac: 21845,
    nextFrac: 21845,
  };

  static setConfig(newConfig: Partial<MsgPrices>): void {
    this.config = { ...this.config, ...newConfig };
  }

  static computeTotalSendingFees(msgBody: Cell): bigint {
    const { fees, remaining } = computeMessageForwardFees(this.config, msgBody);
    const actionFee = fees - remaining;
    return actionFee + fees;
  }

  static computeForwardFees(numTxs: bigint, fulfillPayload?: Cell | null, rejectPayload?: Cell | null): bigint {
    const fullfillPayloadFee = fulfillPayload ? this.computeTotalSendingFees(fulfillPayload) : 0n;
    const rejectPayloadFee = rejectPayload ? this.computeTotalSendingFees(rejectPayload) : 0n;
    return (fullfillPayloadFee > rejectPayloadFee ? fullfillPayloadFee : rejectPayloadFee) * numTxs;
  }
}
