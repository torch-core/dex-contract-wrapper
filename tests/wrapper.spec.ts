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
describe('Wrapper Testcases', () => {
  const endpoint = 'https://testnet-v4.tonhubapi.com';
  const client = new TonClient4({ endpoint });
  const FACTORY_ADDRESS = Address.parse('EQBO9Xw9w0hJQx4kw3RSKu2LROZbtKg4icITKYp5enCQVGCu');
  const TRI_TON_POOL_ADDRESS = Address.parse('EQCEao02tugbZjudFRMfyu2s_nVZli7F_rgxC1OjdvXpsBsw');
  const QUA_TON_POOL_ADDRESS = Address.parse('EQA4rUktNrzOmgZ4OzsOX5Q-C1KelFPCtH8ln2YaHgyAO4kc');
  const TON_ASSET = Asset.ton();
  const TS_TON_ASSET = Asset.jetton('EQA5rOnkPx8xTWvSjKAqEkdLOIM0-IyT_u-5IEQ5R2y9m-36');
  const ST_TON_ASSET = Asset.jetton('EQBbKadthJqQfnEsijYFvi25AKGDhS3CTVAf8oGZYwGk8G8W');
  const TRI_TON_ASSET = Asset.jetton(TRI_TON_POOL_ADDRESS);
  const USDT_ASSET = Asset.jetton(Address.parse('EQBflht80hwbivqv3Hnlhigqfe4RdY4Kb-LSOVldvGBsAgOQ'));
  const USDC_ASSET = Asset.jetton(Address.parse('EQARxQlZfQUxhTcCRg4QraCtxmvw1GoGOeEanbcc55wLZg3E'));
  const CRV_USD_ASSET = Asset.jetton(Address.parse('EQC76HKO16zcESvqLzDXpV98uRNiPDl_TO-g6794VMDGbbNZ'));

  const TRI_USD_POOL_ADDRESS = Address.parse('EQCP0zt6jVBBQrfuVQv2mkGxTx644BY0givW2BskBkJ7oQoN');
  const QUA_USD_POOL_ADDRESS = Address.parse('EQDNrykzaG7kEzmqa0H7nRRudU8EtzDSzYVQ8QEPslOgwDG8');

  const H_TON_ASSET = Asset.jetton('EQDInlQkBcha9-KPGDR-eWi5VGhYPXO5s04amtzZ07s0Kzuu');
  const H_TON_MASTER = Address.parse('EQDInlQkBcha9-KPGDR-eWi5VGhYPXO5s04amtzZ07s0Kzuu');
  const H_TON_VAULT_ADDRESS = Address.parse('EQDruot_WmgJfqy3sz6VwjM5h48eioAblY_tL_j_ZuNcj6nU');
  const TON_VAULT_ADDRESS = Address.parse('EQDB8wYs5U_alBNFPpR9UpI8wQNGhAEJmgrR8kOjSX50gOlH');
  const SENDER_ADDRESS = Address.parse('0QBtvbUwvUMHWiYt85cqAjtMSTOoDCufuBEhh7m6czZTn0wF');

  const triTONPoolRate: Allocation[] = Allocation.createAllocations([
    { asset: TON_ASSET, value: 10n ** 27n },
    { asset: TS_TON_ASSET, value: 10n ** 27n },
    { asset: ST_TON_ASSET, value: 10n ** 27n },
  ]).sort((a, b) => a.asset.compare(b.asset));

  const quaTONPoolRate: Allocation[] = Allocation.createAllocations([
    { asset: H_TON_ASSET, value: 10n ** 27n },
    { asset: TRI_TON_ASSET, value: 10n ** 18n },
  ]).sort((a, b) => a.asset.compare(b.asset));

  let factory: OpenedContract<Factory>;
  let triTONPool: OpenedContract<Pool>;
  let quaTONPool: OpenedContract<Pool>;
  let triUSDPOOL: OpenedContract<Pool>;
  let quaUSDPOOL: OpenedContract<Pool>;

  beforeEach(async () => {
    factory = client.open(Factory.createFromAddress(FACTORY_ADDRESS));
    triTONPool = client.open(Pool.createFromAddress(TRI_TON_POOL_ADDRESS));
    quaTONPool = client.open(Pool.createFromAddress(QUA_TON_POOL_ADDRESS));
    triUSDPOOL = client.open(Pool.createFromAddress(TRI_USD_POOL_ADDRESS));
    quaUSDPOOL = client.open(Pool.createFromAddress(QUA_USD_POOL_ADDRESS));
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
        poolAddress: TRI_TON_POOL_ADDRESS,
        poolAllocations: Allocation.createAllocations([
          { asset: TON_ASSET, value: 1000000000000000000n },
          { asset: TS_TON_ASSET, value: 1000000000000000000n },
        ]),
      };
      const payload = await factory.getDepositPayload(SENDER_ADDRESS, depositParams);
      expect(payload).toBeDefined();
    });

    it('should getDepositPayload() with deposit next successfully', async () => {
      const depositParams: DepositPayload = {
        queryId: 1n,
        poolAddress: TRI_TON_POOL_ADDRESS,
        poolAllocations: Allocation.createAllocations([
          { asset: TON_ASSET, value: 1000000000000000000n },
          { asset: TS_TON_ASSET, value: 1000000000000000000n },
        ]),
        next: {
          type: 'Deposit',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
          metaAllocation: new Allocation({ asset: TON_ASSET, value: 1000000000000000000n }),
        },
      };
      const payload = await factory.getDepositPayload(SENDER_ADDRESS, depositParams);
      expect(payload).toBeDefined();
    });

    it('should getDepositPayload() with swap next successfully', async () => {
      const depositParams: DepositPayload = {
        queryId: 1n,
        poolAddress: TRI_TON_POOL_ADDRESS,
        poolAllocations: Allocation.createAllocations([
          { asset: TON_ASSET, value: 1000000000000000000n },
          { asset: TS_TON_ASSET, value: 1000000000000000000n },
        ]),
        next: {
          type: 'Swap',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
          assetOut: TS_TON_ASSET,
        },
      };
      const payload = await factory.getDepositPayload(SENDER_ADDRESS, depositParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: TRI_TON_POOL_ADDRESS,
        assetIn: TON_ASSET,
        assetOut: TS_TON_ASSET,
        amountIn: 1000000000000000000n,
      };
      const payload = await factory.getSwapPayload(SENDER_ADDRESS, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() with withdraw single mode next successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: TRI_TON_POOL_ADDRESS,
        assetIn: TON_ASSET,
        assetOut: TS_TON_ASSET,
        amountIn: 1000000000000000000n,
        next: {
          type: 'Withdraw',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Single',
            assetOut: TON_ASSET,
          },
        },
      };
      const payload = await factory.getSwapPayload(SENDER_ADDRESS, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() with withdraw balanced mode next successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: TRI_TON_POOL_ADDRESS,
        assetIn: TON_ASSET,
        assetOut: TS_TON_ASSET,
        amountIn: 1000000000000000000n,
        next: {
          type: 'Withdraw',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
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
        poolAddress: TRI_TON_POOL_ADDRESS,
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
        poolAddress: TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
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
        poolAddress: TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Single',
            assetOut: TON_ASSET,
          },
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: TON_ASSET,
        },
      };
      const payload = await factory.getWithdrawPayload(SENDER_ADDRESS, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode and next balanced mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: TON_ASSET,
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
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
        poolAddress: TRI_TON_POOL_ADDRESS,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: TON_ASSET,
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: QUA_TON_POOL_ADDRESS,
          config: {
            mode: 'Single',
            assetOut: TON_ASSET,
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
      const TRI_USD_LP_ASSET = Asset.jetton(TRI_USD_POOL_ADDRESS);

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
          { asset: TON_ASSET, value: 1000000000000000000n },
          { asset: TS_TON_ASSET, value: 1000000000000000000n },
          { asset: ST_TON_ASSET, value: 1000000000000000000n },
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
          { asset: USDT_ASSET, value: 100000n },
          { asset: USDC_ASSET, value: 100000n },
          { asset: CRV_USD_ASSET, value: 10n ** 17n },
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
        assetIn: TON_ASSET,
        assetOut: TS_TON_ASSET,
        amountIn: 1000000000000000000n,
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
        assetIn: USDT_ASSET,
        assetOut: USDC_ASSET,
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
        assetIn: TON_ASSET,
        assetOut: TS_TON_ASSET,
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
        assetIn: USDT_ASSET,
        assetOut: USDC_ASSET,
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
    it('should call getLpAccountData() successfully', async () => {
      const lpAccountAddress = Address.parse('0QCD8mAs2cPvcRiXVAhj6bm8nsEiwlqKqfv8mejxLNYZHfvq');
      const lpAccount = client.open(LpAccount.createFromAddress(lpAccountAddress));
      const lpAccountData = await lpAccount.getLpAccountData();
      expect(lpAccountData).toBeDefined();
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
