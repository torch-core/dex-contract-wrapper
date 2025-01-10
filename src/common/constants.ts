export abstract class ContractType {
  static readonly FACTORY = 0;
  static readonly VAULT = 1;
  static readonly LP_ACCOUNT = 2;
  static readonly POOL = 3;
}

export abstract class PoolType {
  static readonly BASE = 0;
  static readonly META = 1;
}

export abstract class PoolStatus {
  static readonly NOT_EXIST = 0;
  static readonly ACTIVE = 1;
  static readonly IS_STOP = 2;
}

export abstract class SelfInvokeType {
  static readonly ENABLED = true;
  static readonly DISABLED = false;
}

export abstract class NextType {
  static readonly SWAP = 0;
  static readonly DEPOSIT = 1;
  static readonly WITHDRAW = 2;
}
