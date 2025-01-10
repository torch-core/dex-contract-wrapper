export abstract class ExitCode {
  static NotDeployer = 1000;
  static NotAdmin = 1001;
  static InvalidAssetType = 1002;
  static NotSupportedAssetType = 1003;
  static NotVault = 1005;
  static NotFactory = 1006;
  static WrongAsset = 1007;
  static CanOnlyWithdarwOne = 1008;
  static Expired = 1009;
  static InvalidSignature = 1010;
  static MinAmountNotMet = 1011;
  static NotJettonWallet = 1012;
  static WrongNextType = 1013;
  static InvalidSender = 1014;
  static InvalidAmount = 1015;
  static NotLpVault = 1016;
  static NotJettonMaster = 1017;
  static AssetNotFound = 1018;
  static InvalidDepositOneAmount = 1019;
  static SameAsset = 1021;
  static InvalidDepositSender = 1022;
  static InvalidLiquidity = 2001;
  static InvalidRampA = 2003;
  static InvalidRampTime = 2004;
  static NoSignedRates = 2005;
  static NotPool = 2006;
  static PoolInStopState = 2007;
  static InvalidAdminFee = 2008;
  static InvalidFee = 2009;
  static InvalidAChange = 2010;

  static WrongBaseAsset = 3000;
  static WrongMetaAsset = 3001;
  static WrongBasePool = 3002;

  static WrongMetaAmount = 4000;
  static DuplicateDeposit = 4001;
  static WrongOp = 65535;

  static explain(code: number): string {
    switch (code) {
      case ExitCode.NotDeployer:
        return 'Not deployer';
      case ExitCode.NotAdmin:
        return 'Not admin';
      case ExitCode.InvalidAssetType:
        return 'Invalid asset type';
      case ExitCode.NotSupportedAssetType:
        return 'Not supported asset type';
      case ExitCode.NotVault:
        return 'Not vault';
      case ExitCode.NotFactory:
        return 'Not factory';
      case ExitCode.WrongAsset:
        return 'Wrong asset';
      case ExitCode.CanOnlyWithdarwOne:
        return 'Can only withdraw one';
      case ExitCode.Expired:
        return 'Expired';
      case ExitCode.InvalidSignature:
        return 'Invalid signature';
      case ExitCode.MinAmountNotMet:
        return 'Minimum amount not met';
      case ExitCode.NotJettonWallet:
        return 'Not a jetton wallet';
      case ExitCode.WrongNextType:
        return 'Wrong next type';
      case ExitCode.InvalidSender:
        return 'Invalid sender';
      case ExitCode.InvalidAmount:
        return 'Invalid amount';
      case ExitCode.NotLpVault:
        return 'Not an LP vault';
      case ExitCode.NotJettonMaster:
        return 'Not a jetton master';
      case ExitCode.AssetNotFound:
        return 'Asset not found';
      case ExitCode.InvalidDepositOneAmount:
        return 'Invalid deposit one amount';
      case ExitCode.SameAsset:
        return 'Same asset';
      case ExitCode.InvalidDepositSender:
        return 'Invalid deposit sender';
      case ExitCode.InvalidLiquidity:
        return 'Invalid liquidity';
      case ExitCode.InvalidRampA:
        return 'Invalid ramp A';
      case ExitCode.InvalidRampTime:
        return 'Invalid ramp time';
      case ExitCode.NoSignedRates:
        return 'No signed rates';
      case ExitCode.NotPool:
        return 'Not a pool';
      case ExitCode.PoolInStopState:
        return 'Pool in stop state';
      case ExitCode.InvalidAdminFee:
        return 'Invalid admin fee';
      case ExitCode.InvalidFee:
        return 'Invalid fee';
      case ExitCode.InvalidAChange:
        return 'Invalid A change';
      case ExitCode.WrongBaseAsset:
        return 'Wrong base asset';
      case ExitCode.WrongMetaAsset:
        return 'Wrong meta asset';
      case ExitCode.WrongBasePool:
        return 'Wrong base pool';
      case ExitCode.WrongMetaAmount:
        return 'Wrong meta amount';
      case ExitCode.WrongOp:
        return 'Undefined opcode';
      case ExitCode.DuplicateDeposit:
        return 'Dulplicate deposit';
      default:
        return `Unknown Exit Code: ${code}`;
    }
  }
}
