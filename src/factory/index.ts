import { Address, Contract } from '@ton/core';

export class Factory implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Factory(address);
  }
}
