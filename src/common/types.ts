export abstract class ContractType {
  static readonly Factory = 0;
  static readonly vault = 1;
  static readonly LpAccount = 2;
  static readonly Pool = 3;
}

export abstract class PoolType {
  static readonly Base = 0;
  static readonly Meta = 1;
}

export abstract class PoolStatus {
  static readonly NotExist = 0;
  static readonly Active = 1;
  static readonly IsStop = 2;
}

export abstract class SelfInvokeType {
  static readonly Enabled = true;
  static readonly Disabled = false;
}

export abstract class NextType {
  static readonly Swap = 0;
  static readonly Deposit = 1;
  static readonly Withdraw = 2;
}
