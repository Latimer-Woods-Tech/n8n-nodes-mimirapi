## 0.1.2 (2026-08-18)

- n8n verification-scanner conformance: credential test (free /health probe), themed SVG icons on node + credential, `usableAsTool: true`, `NodeConnectionTypes.Main` constants, author email, `overrides` field removed.

## 0.1.1 (2026-08-18)

- Republished from the standalone public repository with npm provenance (required for n8n community-node verification).
- Added `@n8n/node-cli` devDependency per verification guidelines.
- Three importable workflow templates in `templates/` (payout guard, lead router, chart renderer).

# Changelog

## 0.1.0

- Initial release. n8n community node for MimirAPI.
- Credential: **MimirAPI API** (optional x402 `PAYMENT-SIGNATURE` header value, optional base URL override — no API key, no signup).
- Free operations: **Catalog** (`GET /v1/catalog`), **Health** (`GET /health`).
- Paid operations (x402, USDC on Base): **Ping**, **QR Code**, **Chart**, **Social Card**, **Visual Review**, **Route Price**, **Phone Intel**, **Wallet Screen**, **Provenance Certificate**, **Ephemeral Database**, **X402 Audit**.
- Declarative node (`n8nNodesApiVersion: 1`); calls the REST API directly, no extra runtime dependencies. A paid call without a settled payment surfaces the 402 x402 challenge verbatim.
