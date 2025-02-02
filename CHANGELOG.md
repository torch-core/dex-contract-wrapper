# @torch-finance/dex-contract-wrapper

## 0.2.8

### Patch Changes

- 98713ae: If the LP account has no meta asset, it should return null.

## 0.2.7

### Patch Changes

- 7dc3288: Add the ContractProvider parameter to the getCancelDepositPayload method and include corresponding tests.

## 0.2.6

### Patch Changes

- 4df0717: Add the getCancelDepositPayload method in the LP Account, allowing users to cancel the assets they have already deposited in the LP account.

## 0.2.5

### Patch Changes

- 9fd1806: Fix the getVaultData() function to include parsing of the contract type.

## 0.2.4

### Patch Changes

- 9cc6d68: Add get-method tests for all contracts

## 0.2.3

### Patch Changes

- 7e884c3: Parallel request for jetton wallet in deposit payload

## 0.2.2

### Patch Changes

- 877e06a: Refactor params type

## 0.2.1

### Patch Changes

- 1e6dd0c: Fixed typos in type and method names: changed 'Simualate' to 'Simulate' in SimulateSwapExactOutResult and related methods

## 0.2.0

### Minor Changes

- 434fccf: support exact in and exact out in simulate swap

## 0.1.5

### Patch Changes

- 6eee25e: - Adjust the size of NextType.
  - Update the gas estimation for SwapNext.
  - Move the fields shared by withdrawConfig into WithdrawPayload.
  - Use allocation only in scenarios that require sorting and normalization.

## 0.1.4

### Patch Changes

- de6172a: Fixed an issue where depositPayload was missing the fulfillPayload and rejectPayload fields.

## 0.1.3

### Patch Changes

- a8b6f5e: - Remove depositAmounts from DepositPayload and replace it with poolAllocations.
  - Users must normalize and sort depositAmounts, setting non-deposit assets to 0.
  - poolAllocations should only include the pool’s assets.
  - For meta asset deposits, configure directly in DepositNext under metaAllocation.

## 0.1.2

### Patch Changes

- 6680570: Fix the handling of the next operation in the Factory class.

## 0.1.1

### Patch Changes

- 48cdb28: When calculating the gas fee for the forward payload, it is necessary to account for the number of cross-pool interactions (next depth).

## 0.1.0

### Minor Changes

- 959b01d: Interact with torch finance DEX contract by user-specific functions
