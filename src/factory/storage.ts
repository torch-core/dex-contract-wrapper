import { Address, Cell, Dictionary } from '@ton/core';
import { ContractType } from '../common';

export type FactoryData = {
  contractType: ContractType;
  admin: Address;
  baseCode: Cell;
  lpAccountCode: Cell;
  vaultCodes: Dictionary<bigint, Cell>;
  signerKey: Buffer;
  poolCodes: Dictionary<bigint, Cell>;
  lpWalletCode: Cell;
  adminFeeConfig: Dictionary<bigint, bigint>;
};
