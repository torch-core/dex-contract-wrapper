export abstract class Op {
  static readonly Jetton = {
    Transfer: 0xf8a7ea5,
  };

  static readonly Vault = {
    Deposit: 0x95db9d39,
    Withdraw: 0xb5de5f9e,
    Swap: 0x25938561,
  };

  static readonly LpAccount = {
    CancelDeposit: 0xf31f8168,
  };
}
