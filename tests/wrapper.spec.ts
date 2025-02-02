import { Address, OpenedContract, toNano } from '@ton/core';
import { JettonMaster, TonClient4 } from '@ton/ton';
import { Pool } from '../src/pool/contract';
import { Factory } from '../src/factory/contract';
import { LpAccount } from '../src/lp-account/contract';
import { Vault } from '../src/vault/contract';
import { DepositPayload, SwapPayload, WithdrawPayload } from '../src/factory/type';
import { Allocation, Asset, AssetType } from '@torch-finance/core';
import { ContractType } from '../src/common';
import { JettonVaultData } from '../src/vault/storage';
import { FactoryConfig, PoolAssets, PoolConfig } from './config';
describe('Wrapper Testcases', () => {
  const endpoint = 'https://testnet-v4.tonhubapi.com';
  const client = new TonClient4({ endpoint });
  const H_TON_VAULT_ADDRESS = Address.parse('EQAR06-xqpVPH7u26mhpiqLVaSyF6dmidDxLYrOKfcsQeIkz');
  const H_TON_MASTER = Address.parse('EQDInlQkBcha9-KPGDR-eWi5VGhYPXO5s04amtzZ07s0Kzuu');
  const TON_VAULT_ADDRESS = Address.parse('EQC8ntomwJFSx77PRd-TiaWkv5Bqyd3drjsB19zSfBoiegfr');
  const SENDER_ADDRESS = Address.parse('0QBtvbUwvUMHWiYt85cqAjtMSTOoDCufuBEhh7m6czZTn0wF');

  const triTONPoolRate: Allocation[] = Allocation.createAllocations([
    { asset: PoolAssets.TON, value: 10n ** 27n },
    { asset: PoolAssets.TS_TON, value: 10n ** 27n },
    { asset: PoolAssets.ST_TON, value: 10n ** 27n },
  ]).sort((a, b) => a.asset.compare(b.asset));

  const quaTONPoolRate: Allocation[] = Allocation.createAllocations([
    { asset: PoolAssets.H_TON, value: 10n ** 27n },
    { asset: PoolAssets.TRI_TON, value: 10n ** 18n },
  ]).sort((a, b) => a.asset.compare(b.asset));

  let factory: OpenedContract<Factory>;
  let triTONPool: OpenedContract<Pool>;
  let quaTONPool: OpenedContract<Pool>;
  let triUSDPOOL: OpenedContract<Pool>;
  let quaUSDPOOL: OpenedContract<Pool>;

  beforeEach(async () => {
    factory = client.open(Factory.createFromAddress(FactoryConfig.FACTORY_ADDRESS));
    triTONPool = client.open(Pool.createFromAddress(PoolConfig.TRI_TON_POOL_ADDRESS));
    quaTONPool = client.open(Pool.createFromAddress(PoolConfig.QUA_TON_POOL_ADDRESS));
    triUSDPOOL = client.open(Pool.createFromAddress(PoolConfig.TRI_USD_POOL_ADDRESS));
    quaUSDPOOL = client.open(Pool.createFromAddress(PoolConfig.QUA_USD_POOL_ADDRESS));
  });

  describe('Factory get-methods testcases', () => {
    it('should call getFactoryData() successfully', async () => {
      const data = await factory.getFactoryData();
      expect(data).toBeDefined();
    });

    it('should call getAddress() successfully', async () => {
      const address = await factory.getAddress(1n);
      expect(address).toBeDefined();
    });

    it('should getDepositPayload() successfully', async () => {
      const depositParams: DepositPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        poolAllocations: Allocation.createAllocations([
          { asset: PoolAssets.TON, value: 1000000000000000000n },
          { asset: PoolAssets.TS_TON, value: 1000000000000000000n },
        ]),
      };
      const payload = await factory.getDepositPayload(SENDER_ADDRESS, depositParams);
      expect(payload).toBeDefined();
    });

    it('should getDepositPayload() with deposit next successfully', async () => {
      const depositParams: DepositPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        poolAllocations: Allocation.createAllocations([
          { asset: PoolAssets.TON, value: 1000000000000000000n },
          { asset: PoolAssets.TS_TON, value: 1000000000000000000n },
        ]),
        next: {
          type: 'Deposit',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          metaAllocation: new Allocation({ asset: PoolAssets.TON, value: 1000000000000000000n }),
        },
      };
      const payload = await factory.getDepositPayload(SENDER_ADDRESS, depositParams);
      expect(payload).toBeDefined();
    });

    it('should getDepositPayload() with swap next successfully', async () => {
      const depositParams: DepositPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        poolAllocations: Allocation.createAllocations([
          { asset: PoolAssets.TON, value: 1000000000000000000n },
          { asset: PoolAssets.TS_TON, value: 1000000000000000000n },
        ]),
        next: {
          type: 'Swap',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          assetOut: PoolAssets.TS_TON,
        },
      };
      const payload = await factory.getDepositPayload(SENDER_ADDRESS, depositParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        assetIn: PoolAssets.TON,
        assetOut: PoolAssets.TS_TON,
        amountIn: 1000000000000000000n,
      };
      const payload = await factory.getSwapPayload(SENDER_ADDRESS, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() with withdraw single mode next successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        assetIn: PoolAssets.TON,
        assetOut: PoolAssets.TS_TON,
        amountIn: 1000000000000000000n,
        next: {
          type: 'Withdraw',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Single',
            assetOut: PoolAssets.TON,
          },
        },
      };
      const payload = await factory.getSwapPayload(SENDER_ADDRESS, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() with withdraw balanced mode next successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        assetIn: PoolAssets.TON,
        assetOut: PoolAssets.TS_TON,
        amountIn: 1000000000000000000n,
        next: {
          type: 'Withdraw',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Balanced',
          },
        },
      };
      const payload = await factory.getSwapPayload(SENDER_ADDRESS, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with balanced mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with balanced mode and next balanced mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Balanced',
          },
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with balanced mode and next single mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Single',
            assetOut: PoolAssets.TON,
          },
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: PoolAssets.TON,
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode and next balanced mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: PoolAssets.TON,
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Balanced',
          },
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode and next single mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: PoolConfig.TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: PoolAssets.TON,
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: PoolConfig.QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Single',
            assetOut: PoolAssets.TON,
          },
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });
  });

  describe('Pool get-methods testcases', () => {
    it('should call getPoolData() successfully', async () => {
      const triTONPoolData = await triTONPool.getPoolData();
      const quaTONPoolData = await quaTONPool.getPoolData();
      expect(triTONPoolData).toBeDefined();
      expect(quaTONPoolData).toBeDefined();
    });

    it('should call getAssets() successfully', async () => {
      const quaTONPoolAssets = await quaTONPool.getAssets();
      const triTONPoolAssets = await triTONPool.getAssets();
      expect(quaTONPoolAssets).toBeDefined();
      expect(triTONPoolAssets).toBeDefined();
    });

    it('should call getWalletAddress() successfully', async () => {
      const walletAddress = await triTONPool.getWalletAddress(SENDER_ADDRESS);
      expect(walletAddress).toBeDefined();

      const walletAddress2 = await quaTONPool.getWalletAddress(SENDER_ADDRESS);
      expect(walletAddress2).toBeDefined();
    });

    it('should call getVirtualPrice() with rates successfully', async () => {
      const virtualPrice = await triTONPool.getVirtualPrice(triTONPoolRate);

      const virtualPrice2 = await quaTONPool.getVirtualPrice(quaTONPoolRate);
      expect(virtualPrice).toBeDefined();
      expect(virtualPrice2).toBeDefined();
    });

    it('should call getVirtualPrice() without rates successfully', async () => {
      const virtualPrice = await triUSDPOOL.getVirtualPrice();

      const SCRV_USD_ASSET = Asset.jetton(Address.parse('EQBN8qMhmCS2yj9a7KqRJTGPv8AZmfsBnRrw3ClODwpyus8v'));
      const TRI_USD_LP_ASSET = Asset.jetton(PoolConfig.TRI_USD_POOL_ADDRESS);

      const quaUSDPOOLRate = Allocation.createAllocations([
        { asset: SCRV_USD_ASSET, value: 10n ** 18n },
        { asset: TRI_USD_LP_ASSET, value: 10n ** 18n },
      ]).sort((a, b) => a.asset.compare(b.asset));

      const virtualPrice2 = await quaUSDPOOL.getVirtualPrice(quaUSDPOOLRate);
      expect(virtualPrice).toBeDefined();
      expect(virtualPrice2).toBeDefined();
    });

    it('should call simulateDeposit() with rates successfully', async () => {
      const simulateDepositResult = await triTONPool.getSimulateDeposit({
        depositAmounts: Allocation.createAllocations([
          { asset: PoolAssets.TON, value: 1000000000000000000n },
          { asset: PoolAssets.TS_TON, value: 1000000000000000000n },
          { asset: PoolAssets.ST_TON, value: 1000000000000000000n },
        ]),
        rates: triTONPoolRate,
      });
      expect(simulateDepositResult).toBeDefined();
      expect(simulateDepositResult.lpTokenOut).toBeDefined();
      expect(simulateDepositResult.virtualPriceBefore).toBeDefined();
      expect(simulateDepositResult.virtualPriceAfter).toBeDefined();
      expect(simulateDepositResult.lpTotalSupply).toBeDefined();
    });

    it('should call simulateDeposit() without rates successfully', async () => {
      const simulateDepositResult = await triUSDPOOL.getSimulateDeposit({
        depositAmounts: Allocation.createAllocations([
          { asset: PoolAssets.USDT, value: 100000n },
          { asset: PoolAssets.USDC, value: 100000n },
          { asset: PoolAssets.CRV_USD, value: 10n ** 17n },
        ]),
      });
      expect(simulateDepositResult).toBeDefined();
      expect(simulateDepositResult.lpTokenOut).toBeDefined();
      expect(simulateDepositResult.virtualPriceBefore).toBeDefined();
      expect(simulateDepositResult.virtualPriceAfter).toBeDefined();
      expect(simulateDepositResult.lpTotalSupply).toBeDefined();
    });

    it('should call simulateSwap() with rates and ExactIn successfully', async () => {
      const simulateSwapResult = await triTONPool.getSimulateSwap({
        mode: 'ExactIn',
        assetIn: PoolAssets.TON,
        assetOut: PoolAssets.TS_TON,
        amountIn: toNano(0.5),
        rates: triTONPoolRate,
      });
      if (simulateSwapResult.mode !== 'ExactIn') {
        throw new Error('simulateSwapResult.mode is not ExactIn');
      }
      expect(simulateSwapResult).toBeDefined();
      expect(simulateSwapResult.mode).toBe('ExactIn');
      expect(simulateSwapResult.amountOut).toBeDefined();
      expect(simulateSwapResult.virtualPriceBefore).toBeDefined();
      expect(simulateSwapResult.virtualPriceAfter).toBeDefined();
    });

    it('should call simulateSwap() without rates but with ExactIn successfully', async () => {
      const simulateSwapResult = await triUSDPOOL.getSimulateSwap({
        mode: 'ExactIn',
        assetIn: PoolAssets.USDT,
        assetOut: PoolAssets.USDC,
        amountIn: 100000n,
      });
      if (simulateSwapResult.mode !== 'ExactIn') {
        throw new Error('simulateSwapResult.mode is not ExactIn');
      }
      expect(simulateSwapResult).toBeDefined();
      expect(simulateSwapResult.amountOut).toBeDefined();
      expect(simulateSwapResult.virtualPriceBefore).toBeDefined();
      expect(simulateSwapResult.virtualPriceAfter).toBeDefined();
    });

    it('should call simulateSwap() with rates and ExactOut successfully', async () => {
      const simulateSwapResult = await triTONPool.getSimulateSwap({
        mode: 'ExactOut',
        assetIn: PoolAssets.TON,
        assetOut: PoolAssets.TS_TON,
        amountOut: toNano(1),
        rates: triTONPoolRate,
      });
      if (simulateSwapResult.mode != 'ExactOut') {
        throw new Error('simulateSwapResult.mode is not ExactOut');
      }
      expect(simulateSwapResult).toBeDefined();
      expect(simulateSwapResult.amountIn).toBeDefined();
      expect(simulateSwapResult.virtualPriceBefore).toBeDefined();
      expect(simulateSwapResult.virtualPriceAfter).toBeDefined();
    });

    it('should call simulateSwap() without rates but with ExactOut successfully', async () => {
      const simulateSwapResult = await triUSDPOOL.getSimulateSwap({
        mode: 'ExactOut',
        assetIn: PoolAssets.USDT,
        assetOut: PoolAssets.USDC,
        amountOut: 1000n,
      });
      if (simulateSwapResult.mode != 'ExactOut') {
        throw new Error('simulateSwapResult.mode is not ExactOut');
      }

      expect(simulateSwapResult).toBeDefined();
      expect(simulateSwapResult.amountIn).toBeDefined();
      expect(simulateSwapResult.virtualPriceBefore).toBeDefined();
      expect(simulateSwapResult.virtualPriceAfter).toBeDefined();
    });

    it('should call simulateWithdraw() with rates successfully', async () => {
      const simulateWithdrawResult = await triTONPool.getSimulateWithdraw({
        lpAmount: 1000000000000000000n,
        rates: triTONPoolRate,
      });

      expect(simulateWithdrawResult).toBeDefined();
      expect(simulateWithdrawResult.amountOuts).toBeDefined();
      expect(simulateWithdrawResult.virtualPriceBefore).toBeDefined();
      expect(simulateWithdrawResult.virtualPriceAfter).toBeDefined();
    });

    it('should call simulateWithdraw() without rates successfully', async () => {
      const simulateWithdrawResult = await triUSDPOOL.getSimulateWithdraw({
        lpAmount: 1000000000000000000n,
      });
      expect(simulateWithdrawResult).toBeDefined();
      expect(simulateWithdrawResult.amountOuts).toBeDefined();
      expect(simulateWithdrawResult.virtualPriceBefore).toBeDefined();
      expect(simulateWithdrawResult.virtualPriceAfter).toBeDefined();
    });
  });

  describe('Lp Account get-methods testcases', () => {
    it('should call getLpAccountData() with metaAsset successfully', async () => {
      const lpAccountAddress = Address.parse('0QBuvm93yb4HshNJINyfcO6sYFVDjDbXoys8PJOMTtb8u7Xz');
      const lpAccount = client.open(LpAccount.createFromAddress(lpAccountAddress));
      const lpAccountData = await lpAccount.getLpAccountData();
      expect(lpAccountData).toBeDefined();
    });

    it('should call getLpAccountData() without metaAsset successfully', async () => {
      const lpAccountAddress = Address.parse('0QDoOiiY7R5tHgo47qVYJzVwKR-LDqef8__TKrLdfwSB46HL');
      const lpAccount = client.open(LpAccount.createFromAddress(lpAccountAddress));
      const lpAccountData = await lpAccount.getLpAccountData();
      expect(lpAccountData).toBeDefined();
    });
  });

  describe('Lp Account testcases', () => {
    it('should call getCancelDepositPayload() successfully', async () => {
      const lpAccount = client.open(
        LpAccount.createFromAddress(Address.parse('0QBuvm93yb4HshNJINyfcO6sYFVDjDbXoys8PJOMTtb8u7Xz')),
      );
      const payload = await lpAccount.getCancelDepositPayload(3);
      expect(payload).toBeDefined();
    });
  });

  describe('Vault get-methods testcases', () => {
    it('should Jetton/TON Vault call getVaultData() successfully', async () => {
      const jettonVault = client.open(Vault.createFromAddress(H_TON_VAULT_ADDRESS));
      const jettonVaultData = (await jettonVault.getVaultData()) as JettonVaultData;
      expect(jettonVaultData).toBeDefined();
      expect(jettonVaultData.contractType).toBe(ContractType.vault);
      expect(jettonVaultData.assetType).toBe(AssetType.JETTON);
      expect(jettonVaultData.jettonMaster.equals(H_TON_MASTER)).toBeTruthy();
      const jettonMaster = client.open(JettonMaster.create(H_TON_MASTER));
      const jettonWallet = await jettonMaster.getWalletAddress(H_TON_VAULT_ADDRESS);
      expect(jettonWallet.equals(jettonVaultData.jettonWallet)).toBeTruthy();

      const tonVault = client.open(Vault.createFromAddress(TON_VAULT_ADDRESS));
      const tonVaultData = await tonVault.getVaultData();
      expect(tonVaultData).toBeDefined();
      expect(tonVaultData.contractType).toBe(ContractType.vault);
      expect(tonVaultData.assetType).toBe(AssetType.TON);
      expect(jettonVaultData.admin.equals(tonVaultData.admin)).toBeTruthy();
    });
  });
});
