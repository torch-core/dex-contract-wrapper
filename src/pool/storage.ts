import { Address, Cell, Dictionary, Slice } from '@ton/core';
import { ContractType, PoolStatus, PoolType, Size } from '../common';
import { Allocation, Asset, parseAssetsFromNestedCell, parseCoinsFromNestedCell } from '@torch-finance/core';

export type ReserveData = {
  reserves: Allocation[];
  adminFees: Allocation[];
};

export type BasicData = {
  feeNumerator: bigint;
  adminFeeNumerator: bigint;
  initA: number;
  futureA: number;
  initATime: number;
  futureATime: number;
  lpTotalSupply: bigint;
  lpWalletCode: Cell;
  decimals: Allocation[];
  plugins: Dictionary<bigint, Cell>;
};

export type ProofData = {
  baseCode: Cell;
  factory: Address;
};

export type PoolData = {
  contractType: ContractType;
  poolType: PoolType;
  admin: Address;
  signerKey: Buffer; // signer key for pool
  status: PoolStatus; // current status of pool (not exists, active, is stop)
  useRate: boolean; // use external reference redemption rate for yield bearing stable pool
  baseLpIndex: number; // LP Token index in the pool, only for meta pool. In base pool, it's always 0.
  assets: Asset[]; // assets in the pool, already sorted
  reserveData: ReserveData;
  basicData: BasicData;
  proofData: ProofData;
};

export function parsePool(sc: Slice): PoolData {
  const contractType = sc.loadUint(Size.ContractType) as ContractType;
  const poolType = sc.loadUint(Size.PoolType) as PoolType;
  if (poolType !== PoolType.Base && poolType !== PoolType.Meta) {
    throw new Error(`Unsupported pool type: ${poolType}`);
  }
  const admin = sc.loadAddress();
  const signerKeyInt = sc.loadUintBig(Size.SignerKey);
  const signerKey = Buffer.from(signerKeyInt.toString(16), 'hex');
  const status = sc.loadBoolean() ? PoolStatus.IsStop : PoolStatus.Active;
  const useRate = sc.loadBoolean();
  const baseLpIndex = sc.loadUint(Size.BaseLpIndex);
  const assets = parseAssetsFromNestedCell(sc.loadRef());
  const reserveCell = sc.loadRef();
  const reserveSc = reserveCell.beginParse();
  const reserveData: ReserveData = {
    reserves: parseCoinsFromNestedCell(reserveSc.loadRef()).map((item, index) => {
      return new Allocation({ asset: assets[index], value: item });
    }),
    adminFees: parseCoinsFromNestedCell(reserveSc.loadRef()).map((item, index) => {
      return new Allocation({ asset: assets[index], value: item });
    }),
  };
  const basicInfoCell = sc.loadRef();
  const basicInfoSc = basicInfoCell.beginParse();
  const basicData: BasicData = {
    feeNumerator: basicInfoSc.loadCoins(),
    adminFeeNumerator: basicInfoSc.loadCoins(),
    initA: basicInfoSc.loadUint(Size.AmplificationFactor),
    futureA: basicInfoSc.loadUint(Size.AmplificationFactor),
    initATime: basicInfoSc.loadUint(Size.Timestamp),
    futureATime: basicInfoSc.loadUint(Size.Timestamp),
    lpTotalSupply: basicInfoSc.loadCoins(),
    lpWalletCode: basicInfoSc.loadRef(),
    decimals: parseCoinsFromNestedCell(basicInfoSc.loadRef()).map((item, index) => {
      return new Allocation({ asset: assets[index], value: 18n - item });
    }),
    plugins: basicInfoSc.loadDict(Dictionary.Keys.BigUint(4), Dictionary.Values.Cell()),
  };
  const proofCell = sc.loadRef();
  const proofSc = proofCell.beginParse();
  const proofData = {
    baseCode: proofSc.loadRef(),
    factory: proofSc.loadAddress(),
  };
  return {
    contractType,
    poolType,
    admin,
    signerKey,
    status,
    useRate,
    baseLpIndex,
    assets,
    reserveData,
    basicData,
    proofData,
  };
}
