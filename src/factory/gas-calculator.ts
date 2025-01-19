import { Cell } from '@ton/core';

export interface GasConfig {
  bitPrice: bigint;
  cellPrice: bigint;
  lumpPrice: bigint;
  firstFrac: bigint;
}

// TODO: put this into torch core
export class GasCalculator {
  private static config: GasConfig = {
    bitPrice: 26214400n,
    cellPrice: 2621440000n,
    lumpPrice: 400000n,
    firstFrac: 21845n,
  };

  static setConfig(newConfig: Partial<GasConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private static shr16ceil(src: bigint): bigint {
    const rem = src % BigInt(65536);
    return rem === 0n ? src / 65536n : src / 65536n + 1n;
  }

  private static computeFwdFees(cells: bigint, bits: bigint): bigint {
    const { bitPrice, cellPrice, lumpPrice } = this.config;
    return lumpPrice + this.shr16ceil(bitPrice * bits + cellPrice * cells);
  }

  private static computeActionFees(fwdFee: bigint): bigint {
    return this.shr16ceil(fwdFee * this.config.firstFrac);
  }

  private static collectCellStats(cell: Cell, visited: Set<string>, skipRoot = false): { bits: bigint; cells: bigint } {
    const hash = cell.hash().toString();
    if (visited.has(hash)) return { bits: 0n, cells: 0n };
    visited.add(hash);

    let bits = skipRoot ? 0n : BigInt(cell.bits.length);
    let cells = skipRoot ? 0n : 1n;

    for (const ref of cell.refs) {
      const stats = this.collectCellStats(ref, visited, false);
      bits += stats.bits;
      cells += stats.cells;
    }
    return { bits, cells };
  }

  static computeTotalSendingFees(msgBody: Cell): bigint {
    const stats = this.collectCellStats(msgBody, new Set(), true);
    const fwdFee = this.computeFwdFees(stats.cells, stats.bits);
    const actionFee = this.computeActionFees(fwdFee);
    return fwdFee + actionFee;
  }
}
