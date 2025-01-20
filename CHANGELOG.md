# @torch-finance/dex-contract-wrapper

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
