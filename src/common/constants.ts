import { Cell } from '@ton/core';

export abstract class Size {
  static readonly Op = 32;
  static readonly QueryId = 64;
  static readonly Timestamp = 32;
  static readonly SignerKey = 256;
  static readonly AmplificationFactor = 20;
  static readonly BaseLpIndex = 4;
  static readonly ContractType = 5;
  static readonly PoolType = 4;
  static readonly NextType = 2;
  static readonly AssetType = 4;
  static readonly Signature = 64;
  static readonly Proof = 256;
}

export abstract class BaseContract {
  static readonly code = Cell.fromHex(
    'b5ee9c724101070100e1000114ff00f4a413f4bcf2c80b010202cd020502ebd407434c0c05c6c2497c0f81c007e903e900c7e800c7d007e800c7e8000fe0e8cb6cf10c4db0874c7c04074cfc0448c20840bf2af5e6ea3adbe1044b1c17cb8fa35353d0134481ba54c22c09c1b65f43e903e80350c3888b5c2c070002ce3a1e00615481c36cf2497c0f8bb553ec12556e103fcbc38a0304001ced44d0fa4001f861d3ff01f862d1002ec8500501cb055003cf1601fa02017158cb6accc901fb000103a8a006004a216f8821a17321b608c8219953436f8101cc03a403e459a1c2009659f02201ccc9e06c21c99821e42c',
  );
}
