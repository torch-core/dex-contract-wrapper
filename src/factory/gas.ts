import { Cell, toNano } from '@ton/core';
import { computeMessageForwardFees, MsgPrices } from '@ton/ton';
import { WithdrawNext } from './type';
import { SwapNext } from './type';

export abstract class NumTxs {
  static readonly Swap = 7n;
  static readonly Deposit = 8n;
}

export abstract class Gas {
  static readonly JETTON_TRANSFER_GAS = toNano('0.05');
  static readonly DEPOSIT_GAS = toNano('0.2');
  static readonly SWAP_GAS = toNano('0.18');
  static readonly WITHDRAW_GAS = toNano('0.4');
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

  static computeGasForSwapChain(next: SwapNext | WithdrawNext | null): bigint {
    if (!next) return 0n;

    if (next.type === 'swap' && next.next) {
      return Gas.SWAP_NEXT_GAS + this.computeGasForSwapChain(next.next);
    }

    return Gas.SWAP_NEXT_GAS;
  }

  static computeForwardFees(numTxs: bigint, fulfillPayload?: Cell | null, rejectPayload?: Cell | null): bigint {
    const fullfillPayloadFee = fulfillPayload ? this.computeTotalSendingFees(fulfillPayload) : 0n;
    const rejectPayloadFee = rejectPayload ? this.computeTotalSendingFees(rejectPayload) : 0n;
    return (fullfillPayloadFee > rejectPayloadFee ? fullfillPayloadFee : rejectPayloadFee) * numTxs;
  }
}
