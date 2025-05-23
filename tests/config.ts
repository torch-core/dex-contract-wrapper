import { Address } from '@ton/core';
import { Asset } from '@torch-finance/core';

export abstract class FactoryConfig {
  static readonly FACTORY_ADDRESS = Address.parse('EQCphoE6MwHy2kvnim6RrRr71oY6KSTMXiTMAEu-qRS4QUwV');
}

export abstract class PoolConfig {
  static readonly TRI_TON_POOL_ADDRESS = Address.parse('EQDbr509-6mnEyVunP2L4WdOo0WksZohqzpsEzXIJo7RSnfK');
  static readonly QUA_TON_POOL_ADDRESS = Address.parse('EQAE9vvdmXQo193QLtPbEQ0HPU1hqo9Mo3tJPKnT6zACu8Ps');
  static readonly TRI_USD_POOL_ADDRESS = Address.parse('EQDdCoZB1j5TQrU846sQQhCAdF5VCN5xsmOFvVdTuTFj-tM8');
  static readonly QUA_USD_POOL_ADDRESS = Address.parse('EQC5ViFdI0gFdODBgOqJ-3iOxIUrOuQDs5qk-EUwYz7zVqaE');
}

export abstract class PoolAssets {
  static readonly TON = Asset.ton();
  static readonly TS_TON = Asset.jetton('EQA5rOnkPx8xTWvSjKAqEkdLOIM0-IyT_u-5IEQ5R2y9m-36');
  static readonly ST_TON = Asset.jetton('EQBbKadthJqQfnEsijYFvi25AKGDhS3CTVAf8oGZYwGk8G8W');
  static readonly TRI_TON = Asset.jetton(PoolConfig.TRI_TON_POOL_ADDRESS);
  static readonly H_TON = Asset.jetton('EQDInlQkBcha9-KPGDR-eWi5VGhYPXO5s04amtzZ07s0Kzuu');
  static readonly QUA_TON = Asset.jetton(PoolConfig.QUA_TON_POOL_ADDRESS);
  static readonly USDT = Asset.jetton(Address.parse('EQBflht80hwbivqv3Hnlhigqfe4RdY4Kb-LSOVldvGBsAgOQ'));
  static readonly USDC = Asset.jetton(Address.parse('EQARxQlZfQUxhTcCRg4QraCtxmvw1GoGOeEanbcc55wLZg3E'));
  static readonly CRV_USD = Asset.jetton(Address.parse('EQC76HKO16zcESvqLzDXpV98uRNiPDl_TO-g6794VMDGbbNZ'));
  static readonly SCRV_USD = Asset.jetton(Address.parse('EQBN8qMhmCS2yj9a7KqRJTGPv8AZmfsBnRrw3ClODwpyus8v'));
  static readonly TRI_USD = Asset.jetton(PoolConfig.TRI_USD_POOL_ADDRESS);
  static readonly QUA_USD = Asset.jetton(PoolConfig.QUA_USD_POOL_ADDRESS);
}

export abstract class MockSettings {
  static readonly emulateBlockSeq = 27701524;
  static readonly sender = Address.parse('0QAHg-2Oy8Mc2BfENEaBcoDNXvHCu7mc28KkPIks8ZVqwmzg');
}
