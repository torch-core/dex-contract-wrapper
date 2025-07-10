import { Cell, toNano } from '@ton/core';
import { computeFwdFees, MsgPrices } from '@ton/ton';

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

  static collectCellStats(cell: Cell, skipRoot: boolean = false): { bits: number; cells: number } {
    let bits = skipRoot ? 0 : cell.bits.length;
    let cells = skipRoot ? 0 : 1;
    for (let ref of cell.refs) {
      let r = this.collectCellStats(ref);
      cells += r.cells;
      bits += r.bits;
    }
    return { bits, cells };
  }

  static computeForwardFees(numTxs: bigint, fulfillPayload?: Cell | null, rejectPayload?: Cell | null): bigint {
    const fullfillPayloadFee = fulfillPayload
      ? computeFwdFees(
          this.config,
          BigInt(this.collectCellStats(fulfillPayload).cells),
          BigInt(this.collectCellStats(fulfillPayload).bits),
        )
      : 0n;
    const rejectPayloadFee = rejectPayload
      ? computeFwdFees(
          this.config,
          BigInt(this.collectCellStats(rejectPayload).cells),
          BigInt(this.collectCellStats(rejectPayload).bits),
        )
      : 0n;
    return (fullfillPayloadFee > rejectPayloadFee ? fullfillPayloadFee : rejectPayloadFee) * numTxs;
  }
}
