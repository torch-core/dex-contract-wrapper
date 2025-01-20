---
'@torch-finance/dex-contract-wrapper': patch
---

- Adjust the size of NextType.
- Update the gas estimation for SwapNext.
- Move the fields shared by withdrawConfig into WithdrawPayload.
- Use allocation only in scenarios that require sorting and normalization.
