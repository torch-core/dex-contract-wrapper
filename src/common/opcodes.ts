export abstract class Op {
  static readonly Jetton = {
    Transfer: 0xf8a7ea5,
    InternalTransfer: 0x178d4519,
    Notification: 0x7362d09c,
    ProvideWalletAddress: 0x2c76b973,
    TakeWalletAddress: 0xd1735400,
    BurnNotification: 0x7bdd97de,
  };

  static readonly Factory = {
    Deploy: 0xd372158c,
    CreateVault: 0xcbdf3140,
    CreateLpVault: 0x5482139c,
    CreateBasePool: 0x18d8d56e,
    CreateMetaPool: 0x1d1d68dd,
    TopUp: 0xd372158c,
    DepositInternal: 0xf74b5f85,
    UpdatePoolCode: 0x50ae945a,
    UpdateVaultCode: 0x1ab12b78,
    UpdateAdminConfig: 0x9ad37959,
    TransferAdmin: 0x2b8af82e,
    UpdateSignerKey: 0xaf74dd1b,
    StopPool: 0x45776b99,
    UnStopPool: 0x88a204a9,
    Update: 0x98253578,
  };

  static readonly Vault = {
    Deposit: 0x95db9d39,
    Withdraw: 0xb5de5f9e,
    Swap: 0x25938561,
    SwapInternal: 0xfcb1be1e,
    CreateVaultSuccess: 0x416c25f4,
    Payout: 0x4e2ea902,
    WithdrawInternal: 0x1a99da7b,
  };

  static readonly LpAccount = {
    DepositAll: 0xec328fb0,
    CancelDeposit: 0xf31f8168,
  };

  static readonly Pool = {
    Premint: 0x446077df,
    UpdateAdminFeeNumerator: 0xbcc232f0,
    UpdateFeeNumerator: 0x3a2e420d,
    ClaimAdminFee: 0x913e42af,
    RampA: 0xc951044f,
    StopRampA: 0x716143ab,
    DepositBetween: 0xde90e25c,
    SwapBetween: 0xffae5893,
    WithdrawBetween: 0xb4963cdc,
  };
}
