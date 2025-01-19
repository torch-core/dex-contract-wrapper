---
'@torch-finance/dex-contract-wrapper': patch
---

When calculating the gas fee for the forward payload, it is necessary to account for the number of cross-pool interactions (next depth).
