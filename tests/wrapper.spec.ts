import { Address, OpenedContract, toNano } from '@ton/core';
import { TonClient4 } from '@ton/ton';
import { Pool } from '../src/pool/contract';
import { Factory } from '../src/factory/contract';
import { LpAccount } from '../src/lp-account/contract';
import { Vault } from '../src/vault/contract';
import { DepositPayload, SwapPayload, WithdrawPayload } from '../src/factory/type';
import { Allocation, Asset } from '@torch-finance/core';
describe('Wrapper Testcases', () => {
  const endpoint = 'https://testnet-v4.tonhubapi.com';
  const client = new TonClient4({ endpoint });
  const factoryAddress = Address.parse('EQBO9Xw9w0hJQx4kw3RSKu2LROZbtKg4icITKYp5enCQVGCu');
  const triTONPoolAddress = Address.parse('EQCEao02tugbZjudFRMfyu2s_nVZli7F_rgxC1OjdvXpsBsw');
  const quaTONPoolAddress = Address.parse('EQA4rUktNrzOmgZ4OzsOX5Q-C1KelFPCtH8ln2YaHgyAO4kc');
  const tonAsset = Asset.ton();
  const tsTONAsset = Asset.jetton('EQA5rOnkPx8xTWvSjKAqEkdLOIM0-IyT_u-5IEQ5R2y9m-36');
  const stTONAsset = Asset.jetton('EQBbKadthJqQfnEsijYFvi25AKGDhS3CTVAf8oGZYwGk8G8W');
  const triTONAsset = Asset.jetton(triTONPoolAddress);
  const hTONAsset = Asset.jetton('EQDInlQkBcha9-KPGDR-eWi5VGhYPXO5s04amtzZ07s0Kzuu');
  const jettonVaultAddress = Address.parse('EQDruot_WmgJfqy3sz6VwjM5h48eioAblY_tL_j_ZuNcj6nU');
  const tonVaultAddress = Address.parse('EQDB8wYs5U_alBNFPpR9UpI8wQNGhAEJmgrR8kOjSX50gOlH');
  const senderAddress = Address.parse('0QBtvbUwvUMHWiYt85cqAjtMSTOoDCufuBEhh7m6czZTn0wF');

  const triTONPoolRate: Allocation[] = Allocation.createAllocations([
    { asset: tonAsset, value: 10n ** 27n },
    { asset: tsTONAsset, value: 10n ** 27n },
    { asset: stTONAsset, value: 10n ** 27n },
  ]).sort((a, b) => a.asset.compare(b.asset));

  const quaTONPoolRate: Allocation[] = Allocation.createAllocations([
    { asset: hTONAsset, value: 10n ** 27n },
    { asset: triTONAsset, value: 10n ** 18n },
  ]).sort((a, b) => a.asset.compare(b.asset));

  let factory: OpenedContract<Factory>;
  let triTONPool: OpenedContract<Pool>;
  let quaTONPool: OpenedContract<Pool>;

  beforeEach(async () => {
    factory = client.open(Factory.createFromAddress(factoryAddress));
    triTONPool = client.open(Pool.createFromAddress(triTONPoolAddress));
    quaTONPool = client.open(Pool.createFromAddress(quaTONPoolAddress));
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
        poolAddress: triTONPoolAddress,
        poolAllocations: Allocation.createAllocations([
          { asset: tonAsset, value: 1000000000000000000n },
          { asset: tsTONAsset, value: 1000000000000000000n },
        ]),
      };
      const payload = await factory.getDepositPayload(senderAddress, depositParams);
      expect(payload).toBeDefined();
    });

    it('should getDepositPayload() with deposit next successfully', async () => {
      const depositParams: DepositPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        poolAllocations: Allocation.createAllocations([
          { asset: tonAsset, value: 1000000000000000000n },
          { asset: tsTONAsset, value: 1000000000000000000n },
        ]),
        next: {
          type: 'Deposit',
          nextPoolAddress: quaTONPoolAddress,
          metaAllocation: new Allocation({ asset: tonAsset, value: 1000000000000000000n }),
        },
      };
      const payload = await factory.getDepositPayload(senderAddress, depositParams);
      expect(payload).toBeDefined();
    });

    it('should getDepositPayload() with swap next successfully', async () => {
      const depositParams: DepositPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        poolAllocations: Allocation.createAllocations([
          { asset: tonAsset, value: 1000000000000000000n },
          { asset: tsTONAsset, value: 1000000000000000000n },
        ]),
        next: {
          type: 'Swap',
          nextPoolAddress: quaTONPoolAddress,
          assetOut: tsTONAsset,
        },
      };
      const payload = await factory.getDepositPayload(senderAddress, depositParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        assetIn: tonAsset,
        assetOut: tsTONAsset,
        amountIn: 1000000000000000000n,
      };
      const payload = await factory.getSwapPayload(senderAddress, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() with withdraw single mode next successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        assetIn: tonAsset,
        assetOut: tsTONAsset,
        amountIn: 1000000000000000000n,
        next: {
          type: 'Withdraw',
          nextPoolAddress: quaTONPoolAddress,
          config: {
            mode: 'Single',
            assetOut: tonAsset,
          },
        },
      };
      const payload = await factory.getSwapPayload(senderAddress, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getSwapPayload() with withdraw balanced mode next successfully', async () => {
      const swapParams: SwapPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        assetIn: tonAsset,
        assetOut: tsTONAsset,
        amountIn: 1000000000000000000n,
        next: {
          type: 'Withdraw',
          nextPoolAddress: quaTONPoolAddress,
          config: {
            mode: 'Balanced',
          },
        },
      };
      const payload = await factory.getSwapPayload(senderAddress, swapParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with balanced mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
      };
      const payload = await factory.getWithdrawPayload(senderAddress, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with balanced mode and next balanced mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: quaTONPoolAddress,
          config: {
            mode: 'Balanced',
          },
        },
      };
      const payload = await factory.getWithdrawPayload(senderAddress, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with balanced mode and next single mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Balanced',
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: quaTONPoolAddress,
          config: {
            mode: 'Single',
            assetOut: tonAsset,
          },
        },
      };
      const payload = await factory.getWithdrawPayload(senderAddress, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: tonAsset,
        },
      };
      const payload = await factory.getWithdrawPayload(senderAddress, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode and next balanced mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: tonAsset,
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: quaTONPoolAddress,
          config: {
            mode: 'Balanced',
          },
        },
      };
      const payload = await factory.getWithdrawPayload(senderAddress, withdrawParams);
      expect(payload).toBeDefined();
    });

    it('should call getWithdrawPayload() with single mode and next single mode successfully', async () => {
      const withdrawParams: WithdrawPayload = {
        queryId: 1n,
        poolAddress: triTONPoolAddress,
        burnLpAmount: 1000000000000000000n,
        config: {
          mode: 'Single',
          assetOut: tonAsset,
        },
        next: {
          type: 'Withdraw',
          nextPoolAddress: quaTONPoolAddress,
          config: {
            mode: 'Single',
            assetOut: tonAsset,
          },
        },
      };
      const payload = await factory.getWithdrawPayload(senderAddress, withdrawParams);
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
      const walletAddress = await triTONPool.getWalletAddress(senderAddress);
      expect(walletAddress).toBeDefined();

      const walletAddress2 = await quaTONPool.getWalletAddress(senderAddress);
      expect(walletAddress2).toBeDefined();
    });

    it('should call getVirtualPrice() successfully', async () => {
      const virtualPrice = await triTONPool.getVirtualPrice(triTONPoolRate);

      const virtualPrice2 = await quaTONPool.getVirtualPrice(quaTONPoolRate);
      expect(virtualPrice).toBeDefined();
      expect(virtualPrice2).toBeDefined();
    });

    it('should call simulateDeposit() successfully', async () => {
      const simulateDepositResult = await triTONPool.getSimulateDeposit({
        depositAmounts: Allocation.createAllocations([
          { asset: tonAsset, value: 1000000000000000000n },
          { asset: tsTONAsset, value: 1000000000000000000n },
          { asset: stTONAsset, value: 1000000000000000000n },
        ]),
        rates: triTONPoolRate,
      });
      expect(simulateDepositResult).toBeDefined();
      expect(simulateDepositResult.lpTokenOut).toBeDefined();
      expect(simulateDepositResult.virtualPriceBefore).toBeDefined();
      expect(simulateDepositResult.virtualPriceAfter).toBeDefined();
      expect(simulateDepositResult.lpTotalSupply).toBeDefined();
    });
    it('should invoke simulateSwap() with ExactIn successfully', async () => {
      const simulateSwapResult = await triTONPool.getSimulateSwap({
        mode: 'ExactIn',
        assetIn: tonAsset,
        assetOut: tsTONAsset,
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

    it('should call simulateSwap() with ExactOut successfully', async () => {
      const simulateSwapResult = await triTONPool.getSimulateSwap({
        mode: 'ExactOut',
        assetIn: tonAsset,
        assetOut: tsTONAsset,
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
    it('should Jetton Vault call getJettonVaultData() successfully', async () => {
      const jettonVault = client.open(Vault.createFromAddress(jettonVaultAddress));
      const jettonVaultData = await jettonVault.getVaultData();
      expect(jettonVaultData).toBeDefined();
    });

    it('should Ton Vault call getTonVaultData() successfully', async () => {
      const tonVault = client.open(Vault.createFromAddress(tonVaultAddress));
      const tonVaultData = await tonVault.getVaultData();
      expect(tonVaultData).toBeDefined();
    });
  });
});
