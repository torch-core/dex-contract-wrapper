import { SwapNext, WithdrawNext } from './type';
import { Cell, toNano } from '@ton/core';
import { GasCalculator } from './gas-calculator';

export abstract class NumTxs {
  static readonly Swap = 7n;
  static readonly Deposit = 8n;
}

export abstract class Gas {
  static readonly JETTON_TRANSFER_GAS = toNano('0.05');
  static readonly DEPOSIT_GAS = toNano('0.2');
  static readonly SWAP_GAS = toNano('0.18');
  static readonly WITHDRAW_GAS = toNano('0.4');
  static readonly DEPOSIT_OR_SWAP_NEXT_GAS = toNano('0.1');
  static readonly WITHDRAW_NEXT_GAS = toNano('0.35');
}

export const computeGasForSwapChain = (next: SwapNext | WithdrawNext | null): bigint => {
  if (!next) return 0n;

  if (next.type === 'swap' && next.next) {
    return Gas.DEPOSIT_OR_SWAP_NEXT_GAS + computeGasForSwapChain(next.next);
  }

  if (next.type === 'withdraw') {
    return Gas.WITHDRAW_NEXT_GAS;
  }

  return Gas.DEPOSIT_OR_SWAP_NEXT_GAS;
};

export const computeForwardFees = (
  numTxs: bigint,
  fulfillPayload?: Cell | null,
  rejectPayload?: Cell | null,
): bigint => {
  const fullfillPayloadFee = fulfillPayload ? GasCalculator.computeTotalSendingFees(fulfillPayload) : 0n;
  const rejectPayloadFee = rejectPayload ? GasCalculator.computeTotalSendingFees(rejectPayload) : 0n;
  return (fullfillPayloadFee > rejectPayloadFee ? fullfillPayloadFee : rejectPayloadFee) * numTxs;
};
