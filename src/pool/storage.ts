import { Address, Cell, Dictionary, Slice } from '@ton/core';
import {
  AMPLIFICATION_FACTOR_SIZE,
  BASE_LP_INDEX_SIZE,
  CONTRACT_TYPE_SIZE,
  ContractType,
  POOL_TYPE_SIZE,
  PoolStatus,
  PoolType,
  SIGNER_KEY_SIZE,
  TIMESTAMP_SIZE,
} from '../common';
import { Allocation, Asset, parseAssetsFromNestedCell, parseCoinsFromNestedCell } from '@torch-finance/core';

export type ReserveData = {
  reserves: Allocation[];
  adminFees: Allocation[];
};

export type BasicData = {
  feeNumerator: bigint;
  adminFeeNumerator: bigint;
  initA: bigint;
  futureA: bigint;
  initATime: bigint;
  futureATime: bigint;
  lpTotalSupply: bigint;
  lpWalletCode: Cell;
  precisionMultipliers: bigint[];
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
  const contractType = sc.loadUint(CONTRACT_TYPE_SIZE) as ContractType;
  const poolType = sc.loadUint(POOL_TYPE_SIZE) as PoolType;
  if (poolType !== PoolType.BASE && poolType !== PoolType.META) {
    throw new Error(`Unsupported pool type: ${poolType}`);
  }
  const admin = sc.loadAddress();
  const signerKeyInt = sc.loadUintBig(SIGNER_KEY_SIZE);
  const signerKey = Buffer.from(signerKeyInt.toString(16), 'hex');
  const status = sc.loadBoolean() ? PoolStatus.IS_STOP : PoolStatus.ACTIVE;
  const useRate = sc.loadBoolean();
  const baseLpIndex = sc.loadUint(BASE_LP_INDEX_SIZE);
  const assets = parseAssetsFromNestedCell(sc.loadRef());
  const reserveCell = sc.loadRef();
  const reserveSc = reserveCell.beginParse();
  const reserveData: ReserveData = {
    reserves: parseCoinsFromNestedCell(reserveSc.loadRef()).map((item, index) => {
      return new Allocation({ asset: assets[index], amount: item });
    }),
    adminFees: parseCoinsFromNestedCell(reserveSc.loadRef()).map((item, index) => {
      return new Allocation({ asset: assets[index], amount: item });
    }),
  };
  const basicInfoCell = sc.loadRef();
  const basicInfoSc = basicInfoCell.beginParse();
  const basicData: BasicData = {
    feeNumerator: BigInt(basicInfoSc.loadCoins()),
    adminFeeNumerator: BigInt(basicInfoSc.loadCoins()),
    initA: BigInt(basicInfoSc.loadUint(AMPLIFICATION_FACTOR_SIZE)),
    futureA: BigInt(basicInfoSc.loadUint(AMPLIFICATION_FACTOR_SIZE)),
    initATime: BigInt(basicInfoSc.loadUint(TIMESTAMP_SIZE)),
    futureATime: BigInt(basicInfoSc.loadUint(TIMESTAMP_SIZE)),
    lpTotalSupply: BigInt(basicInfoSc.loadCoins()),
    lpWalletCode: basicInfoSc.loadRef(),
    precisionMultipliers: parseCoinsFromNestedCell(basicInfoSc.loadRef()),
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
