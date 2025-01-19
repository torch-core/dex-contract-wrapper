import { Cell, toNano } from '@ton/core';
import { SwapNext, WithdrawNext } from './type';

export class GasCalculator {
  // Constants
  static readonly JETTON_TRANSFER_GAS = toNano('0.05');
  static readonly DEPOSIT_GAS = toNano('0.2');
  static readonly SWAP_GAS = toNano('0.18');
  static readonly WITHDRAW_GAS = toNano('0.4');
  static readonly DEPOSIT_OR_SWAP_NEXT_GAS = toNano('0.05');
  static readonly WITHDRAW_NEXT_GAS = toNano('0.35');

  private static shr16ceil(src: bigint): bigint {
    const rem = src % BigInt(65536);
    let res = src / 65536n;
    if (rem != BigInt(0)) {
      res += BigInt(1);
    }
    return res;
  }

  private static computeFwdFees(
    bitPrice: bigint,
    cellPrice: bigint,
    cells: bigint,
    bits: bigint,
    lumpPrice: bigint = 400000n,
  ): bigint {
    return lumpPrice + this.shr16ceil(bitPrice * bits + cellPrice * cells);
  }

  private static computeActionFees(fwdFee: bigint, firstFrac: bigint = 21845n): bigint {
    return this.shr16ceil(fwdFee * firstFrac);
  }

  private static collectCellStats(
    cell: Cell,
    visited: Array<string>,
    skipRoot: boolean = false,
  ): { bits: bigint; cells: bigint } {
    let bits = skipRoot ? 0n : BigInt(cell.bits.length);
    let cells = skipRoot ? 0n : 1n;
    const hash = cell.hash().toString();
    if (visited.includes(hash)) {
      // We should not account for current cell data if visited
      return { bits: 0n, cells: 0n };
    } else {
      visited.push(hash);
    }
    for (const ref of cell.refs) {
      const r = this.collectCellStats(ref, visited);
      cells += r.cells;
      bits += r.bits;
    }
    return { bits, cells };
  }

  static computeTotalSendingFees(msgBody: Cell): bigint {
    const stats = this.collectCellStats(msgBody, [], true);
    const bitPrice = 26214400n;
    const cellPrice = 2621440000n;
    const fwdFee = this.computeFwdFees(bitPrice, cellPrice, stats.cells, stats.bits);
    const actionFee = this.computeActionFees(fwdFee);
    return fwdFee + actionFee;
  }

  static computeForwardFees(fulfillPayload?: Cell | null, rejectPayload?: Cell | null): bigint {
    const fullfillPayloadFee = fulfillPayload ? this.computeTotalSendingFees(fulfillPayload) : 0n;
    const rejectPayloadFee = rejectPayload ? this.computeTotalSendingFees(rejectPayload) : 0n;
    return fullfillPayloadFee > rejectPayloadFee ? fullfillPayloadFee : rejectPayloadFee;
  }

  static computeGasForSwapChain(next: SwapNext | WithdrawNext | null): bigint {
    if (!next) return 0n;

    if (next.type === 'swap' && next.next) {
      return this.DEPOSIT_OR_SWAP_NEXT_GAS + this.computeGasForSwapChain(next.next);
    }

    if (next.type === 'withdraw') {
      return this.WITHDRAW_NEXT_GAS;
    }

    return this.DEPOSIT_OR_SWAP_NEXT_GAS;
  }
}
