# n8n-nodes-mimirapi

An [n8n](https://n8n.io) community node for **[MimirAPI](https://mimirapi.com)** — pay-per-call tools for agents over [x402](https://x402.org) (USDC on Base). **No API key, no signup.** Discovery is free; every paid tool quotes its price with HTTP 402 and serves the result once the payment is settled.

[n8n](https://n8n.io) is a fair-code workflow automation platform.

## Installation

In n8n: **Settings → Community Nodes → Install**, and enter:

```
n8n-nodes-mimirapi
```

Or self-hosted via npm:

```bash
npm install n8n-nodes-mimirapi
```

## Credentials

Create a **MimirAPI API** credential. There is nothing to sign up for:

- **Payment Signature** — leave blank for the free operations (Catalog, Health), or to see the 402 challenge a paid tool quotes. To pay, settle the challenge with your wallet (x402 `exact` scheme, USDC on Base — e.g. via [x402-fetch](https://www.npmjs.com/package/x402-fetch) or a CDP wallet) and paste the resulting `PAYMENT-SIGNATURE` header value here.
- **Base URL** — leave as `https://mimirapi.com` unless told otherwise.

## Operations

| Operation | Endpoint | Price | Output |
| --- | --- | --- | --- |
| **Catalog** | `GET /v1/catalog` | free | JSON: every live SKU with its price and input/output schema |
| **Health** | `GET /health` | free | JSON: liveness and SKU counts |
| **Ping** | `GET /v1/ping` | $0.001 | JSON: pong + server time — the cheapest proof your x402 wiring works |
| **QR Code** | `GET /v1/qr` | $0.002 | JSON: deterministic QR `svg` from any text or URL, selectable error-correction level |
| **Chart** | `POST /v1/chart` | $0.01 | JSON: deterministic 800x400 line/bar chart `svg` from a comma-separated numeric series |
| **Social Card** | `GET /v1/og-image` | $0.01 | JSON: deterministic 1200x630 Open Graph `svg` from a title + optional subtitle, dark or light |
| **Visual Review** | `POST /v1/visual-review` | $0.01 | JSON: full-page screenshot (data URI PNG) + axe-core accessibility audit for any https URL |
| **Route Price** | `GET /v1/route/price` | $0.03 | JSON: live crypto/token spot price, optionally cross-validated against a second source |
| **Phone Intel** | `GET /v1/phone/intel` | $0.03 | JSON: E.164 validity, country, carrier, and line type for any number |
| **Wallet Screen** | `GET /v1/wallet/screen` | $0.05 | JSON: sanctioned true/false from the public Chainalysis oracle for an EVM address |
| **Provenance Certificate** | `POST /v1/provenance/certificate` | $0.25 | JSON: chain-of-custody license certificate (SHA-256 content hash + HMAC signature) |
| **Ephemeral Database** | `POST /v1/db` | $0.25 | JSON: connection string for a real Postgres database with a TTL; teardown is automatic |
| **X402 Audit** | `POST /v1/x402-audit` | $0.25 | JSON: conformance verdict for any x402 counter (402 coherence, Bazaar metadata, index listing) |

The counter's SMS-sending SKU is deliberately not exposed as an operation: sending carrier messages from a broad automation surface is an abuse magnet with real regulatory exposure (TCPA/10DLC). Call it directly against the API if you need it.

## How payment works

MimirAPI is an x402 counter. Calling a paid operation **without** a settled payment does not fail silently — the node surfaces the HTTP 402 response, whose body is the x402 challenge listing the accepted payment (`exact` scheme, USDC on Base, with the exact amount). Settle that challenge with your wallet, put the signature in the credential's **Payment Signature** field, and run the same operation again — the identical request is then served.

The free operations (Catalog, Health) never require payment and work with the signature blank.

## Compatibility

Requires n8n with `n8nNodesApiVersion: 1`. Declarative node; no extra runtime dependencies.

## Resources

- MimirAPI docs (agent-readable): <https://mimirapi.com/llms.txt>
- Catalog (machine-readable): <https://mimirapi.com/v1/catalog>
- OpenAPI spec: <https://mimirapi.com/.well-known/openapi.json>
- Official JS/TS client (handles the 402 round trip for you): [`mimirapi`](https://www.npmjs.com/package/mimirapi)
- n8n community nodes docs: <https://docs.n8n.io/integrations/community-nodes/>

## Templates

Importable starter workflows live in [`templates/`](./templates/) — in n8n: **Workflows → Import from File**, then select your MimirAPI credential on the node.

- [`wallet-screen-before-payout.json`](./templates/wallet-screen-before-payout.json) — webhook-guarded payout check: block on a sanctions hit, clear on a verified pass, and **hold when the oracle is unavailable** (`sanctioned: null` is unknown, never clear). $0.05/check.
- [`lead-phone-intel-router.json`](./templates/lead-phone-intel-router.json) — route inbound leads by real line type: mobile goes to your SMS sequence, landline/VoIP to email or a call task, so SMS credits are never burned on numbers that can't receive them. $0.03/lead.
- [`weekly-metrics-chart.json`](./templates/weekly-metrics-chart.json) — a number series in, a deterministic 800x400 chart SVG out; swap the sample values for your own data source. $0.01/render.

## License

MIT © Latimer Woods Tech
