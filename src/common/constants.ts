import { toNano } from '@ton/core';

export abstract class Size {
  static readonly Op = 32;
  static readonly QueryId = 64;
  static readonly Timestamp = 32;
  static readonly SignerKey = 256;
  static readonly AmplificationFactor = 20;
  static readonly BaseLpIndex = 4;
  static readonly ContractType = 5;
  static readonly PoolType = 4;
  static readonly NextType = 4;
  static readonly Signature = 64;
}

export abstract class Gas {
  static readonly JettonTransfer = toNano('0.065');
  static readonly deposit = toNano('0.3');
}
