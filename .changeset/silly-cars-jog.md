---
'@torch-finance/dex-contract-wrapper': patch
---

- Remove depositAmounts from DepositPayload and replace it with poolAllocations.
- Users must normalize and sort depositAmounts, setting non-deposit assets to 0.
- poolAllocations should only include the pool’s assets.
- For meta asset deposits, configure directly in DepositNext under metaAllocation.
