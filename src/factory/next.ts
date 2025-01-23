import { SwapNext, WithdrawNext } from './type';

export function countNextDepth(next: SwapNext | WithdrawNext | null): bigint {
  if (!next) return 0n;
  if (next.type === 'Swap' && next.next) {
    return 1n + countNextDepth(next.next);
  }
  return 1n;
}
