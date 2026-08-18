import type { INodeProperties, INodeType, INodeTypeDescription } from 'n8n-workflow';

/** Chart operation fields (`POST /v1/chart`). */
const chartFields: INodeProperties[] = [
  {
    displayName: 'Chart Type',
    name: 'chartType',
    type: 'options',
    default: 'line',
    options: [
      { name: 'Bar', value: 'bar' },
      { name: 'Line', value: 'line' },
    ],
    description: 'Rendering style for the 800x400 chart SVG',
    displayOptions: { show: { operation: ['chart'] } },
    routing: { send: { type: 'body', property: 'type' } },
  },
  {
    displayName: 'Values',
    name: 'values',
    type: 'string',
    default: '',
    required: true,
    placeholder: '3, 1, 4, 1, 5',
    description: 'Comma-separated numeric series to plot (1–100 points)',
    displayOptions: { show: { operation: ['chart'] } },
    routing: {
      send: {
        type: 'body',
        property: 'values',
        value: '={{ $value.split(",").map((v) => Number(v.trim())) }}',
      },
    },
  },
  {
    displayName: 'Labels',
    name: 'labels',
    type: 'string',
    default: '',
    placeholder: 'Mon, Tue, Wed',
    description: 'Optional comma-separated labels, one per value (each up to 24 chars)',
    displayOptions: { show: { operation: ['chart'] } },
    routing: {
      send: {
        type: 'body',
        property: 'labels',
        value: '={{ $value ? $value.split(",").map((v) => v.trim()) : undefined }}',
      },
    },
  },
  {
    displayName: 'Chart Title',
    name: 'chartTitle',
    type: 'string',
    default: '',
    description: 'Optional chart title (up to 80 chars)',
    displayOptions: { show: { operation: ['chart'] } },
    routing: { send: { type: 'body', property: 'title', value: '={{ $value || undefined }}' } },
  },
];

/** Ephemeral Database operation fields (`POST /v1/db`). */
const ephemeralDbFields: INodeProperties[] = [
  {
    displayName: 'TTL Hours',
    name: 'ttlHours',
    type: 'number',
    default: 24,
    typeOptions: { minValue: 1, maxValue: 168 },
    description: 'Hours until the database is torn down automatically (1–168)',
    displayOptions: { show: { operation: ['ephemeralDb'] } },
    routing: { send: { type: 'body', property: 'ttlHours' } },
  },
];

/** Social Card operation fields (`GET /v1/og-image`). */
const socialCardFields: INodeProperties[] = [
  {
    displayName: 'Card Title',
    name: 'cardTitle',
    type: 'string',
    default: '',
    required: true,
    description: 'Title text on the 1200x630 card (up to 120 chars)',
    displayOptions: { show: { operation: ['ogImage'] } },
    routing: { send: { type: 'query', property: 'title' } },
  },
  {
    displayName: 'Subtitle',
    name: 'subtitle',
    type: 'string',
    default: '',
    description: 'Optional subtitle text (up to 200 chars)',
    displayOptions: { show: { operation: ['ogImage'] } },
    routing: { send: { type: 'query', property: 'subtitle' } },
  },
  {
    displayName: 'Theme',
    name: 'theme',
    type: 'options',
    default: 'dark',
    options: [
      { name: 'Dark', value: 'dark' },
      { name: 'Light', value: 'light' },
    ],
    description: 'Color theme of the card',
    displayOptions: { show: { operation: ['ogImage'] } },
    routing: { send: { type: 'query', property: 'theme' } },
  },
];

/** Phone Intel operation fields (`GET /v1/phone/intel`). */
const phoneIntelFields: INodeProperties[] = [
  {
    displayName: 'Phone Number',
    name: 'phoneNumber',
    type: 'string',
    default: '',
    required: true,
    placeholder: '+14155552671',
    description: 'Phone number in E.164 or loosely formatted',
    displayOptions: { show: { operation: ['phoneIntel'] } },
    routing: { send: { type: 'query', property: 'number' } },
  },
];

/** Provenance Certificate operation fields (`POST /v1/provenance/certificate`). */
const provenanceFields: INodeProperties[] = [
  {
    displayName: 'Content Hash',
    name: 'contentHash',
    type: 'string',
    default: '',
    required: true,
    description: 'SHA-256 hex of the asset being licensed',
    displayOptions: { show: { operation: ['provenanceCert'] } },
    routing: { send: { type: 'body', property: 'contentHash' } },
  },
  {
    displayName: 'Subject',
    name: 'subject',
    type: 'string',
    default: '',
    required: true,
    description: 'Who or what the certificate is issued to',
    displayOptions: { show: { operation: ['provenanceCert'] } },
    routing: { send: { type: 'body', property: 'subject' } },
  },
  {
    displayName: 'License',
    name: 'license',
    type: 'string',
    default: '',
    required: true,
    description: 'License terms the certificate binds to the asset',
    displayOptions: { show: { operation: ['provenanceCert'] } },
    routing: { send: { type: 'body', property: 'license' } },
  },
];

/** QR Code operation fields (`GET /v1/qr`). */
const qrFields: INodeProperties[] = [
  {
    displayName: 'Data',
    name: 'data',
    type: 'string',
    default: '',
    required: true,
    description: 'Text or URL to encode (up to 1000 chars)',
    displayOptions: { show: { operation: ['qr'] } },
    routing: { send: { type: 'query', property: 'data' } },
  },
  {
    displayName: 'Error Correction Level',
    name: 'ecl',
    type: 'options',
    default: 'M',
    options: [
      { name: 'H', value: 'H' },
      { name: 'L', value: 'L' },
      { name: 'M', value: 'M' },
      { name: 'Q', value: 'Q' },
    ],
    description: 'QR error-correction level: L 7%, M 15%, Q 25%, H 30% recovery',
    displayOptions: { show: { operation: ['qr'] } },
    routing: { send: { type: 'query', property: 'ecl' } },
  },
];

/** Route Price operation fields (`GET /v1/route/price`). */
const routePriceFields: INodeProperties[] = [
  {
    displayName: 'Symbol',
    name: 'symbol',
    type: 'string',
    default: 'BTC',
    required: true,
    description: 'Asset symbol or name (BTC, ETH, WIF, bitcoin)',
    displayOptions: { show: { operation: ['routePrice'] } },
    routing: { send: { type: 'query', property: 'symbol' } },
  },
  {
    displayName: 'Quote Currency',
    name: 'vs',
    type: 'string',
    default: 'USD',
    description: 'Currency the price is quoted in',
    displayOptions: { show: { operation: ['routePrice'] } },
    routing: { send: { type: 'query', property: 'vs' } },
  },
  {
    displayName: 'Verify',
    name: 'verify',
    type: 'boolean',
    default: false,
    description: 'Whether to cross-validate the price against a second independent source',
    displayOptions: { show: { operation: ['routePrice'] } },
    routing: { send: { type: 'query', property: 'verify', value: '={{ $value ? "1" : "0" }}' } },
  },
];

/** Visual Review operation fields (`POST /v1/visual-review`). */
const visualReviewFields: INodeProperties[] = [
  {
    displayName: 'Page URL',
    name: 'reviewUrl',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'https://example.com',
    description: 'Public https URL to render and audit',
    displayOptions: { show: { operation: ['visualReview'] } },
    routing: { send: { type: 'body', property: 'url' } },
  },
];

/** Wallet Screen operation fields (`GET /v1/wallet/screen`). */
const walletScreenFields: INodeProperties[] = [
  {
    displayName: 'Wallet Address',
    name: 'address',
    type: 'string',
    default: '',
    required: true,
    placeholder: '0x…',
    description: '0x-prefixed 40-hex-char EVM address to screen',
    displayOptions: { show: { operation: ['walletScreen'] } },
    routing: { send: { type: 'query', property: 'address' } },
  },
];

/** X402 Audit operation fields (`POST /v1/x402-audit`). */
const x402AuditFields: INodeProperties[] = [
  {
    displayName: 'Counter URL',
    name: 'auditUrl',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'https://example.com/v1/tool',
    description: 'HTTPS URL of the x402 resource to weigh',
    displayOptions: { show: { operation: ['x402Audit'] } },
    routing: { send: { type: 'body', property: 'url' } },
  },
];

/**
 * MimirAPI node — pay-per-call tools for agents over x402 (USDC on Base),
 * from https://mimirapi.com. Declarative node: each operation maps to a REST
 * endpoint. Discovery (Catalog, Health) is free; a paid SKU without a settled
 * payment answers HTTP 402 with the x402 challenge quoting its price — settle
 * it with your wallet and supply the signature via the MimirAPI credential.
 */
export class MimirApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MimirAPI',
    name: 'mimirApi',
    icon: 'fa:coins',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Pay-per-call tools for agents over x402 — no API key, no signup (mimirapi.com)',
    defaults: { name: 'MimirAPI' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'mimirApiApi', required: true }],
    requestDefaults: {
      baseURL: '={{$credentials.baseUrl || "https://mimirapi.com"}}',
      headers: { Accept: 'application/json' },
    },
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        default: 'catalog',
        options: [
          {
            name: 'Catalog',
            value: 'catalog',
            action: 'List the catalog of tools',
            description: 'Every live SKU with its price and input/output schema. Free, never metered.',
            routing: { request: { method: 'GET', url: '/v1/catalog' } },
          },
          {
            name: 'Chart',
            value: 'chart',
            action: 'Render a chart image',
            description:
              'A numeric series rendered as a deterministic 800x400 line or bar chart SVG ($0.01/call)',
            routing: { request: { method: 'POST', url: '/v1/chart' } },
          },
          {
            name: 'Ephemeral Database',
            value: 'ephemeralDb',
            action: 'Provision an ephemeral database',
            description:
              'A real Postgres database with a TTL — connection string returned, teardown automatic ($0.25/call)',
            routing: { request: { method: 'POST', url: '/v1/db' } },
          },
          {
            name: 'Health',
            value: 'health',
            action: 'Check counter health',
            description: 'Liveness and SKU counts. Free, never metered.',
            routing: { request: { method: 'GET', url: '/health' } },
          },
          {
            name: 'Phone Intel',
            value: 'phoneIntel',
            action: 'Look up phone number intelligence',
            description:
              'Validity, country, carrier, and line type (mobile / landline / voip) for any number ($0.03/call)',
            routing: { request: { method: 'GET', url: '/v1/phone/intel' } },
          },
          {
            name: 'Ping',
            value: 'ping',
            action: 'Ping the counter',
            description:
              'Paid liveness probe — the cheapest proof your x402 payment wiring works ($0.001/call)',
            routing: { request: { method: 'GET', url: '/v1/ping' } },
          },
          {
            name: 'Provenance Certificate',
            value: 'provenanceCert',
            action: 'Issue a provenance certificate',
            description:
              'Chain-of-custody license certificate: content hash bound to subject and license terms under an HMAC signature ($0.25/call)',
            routing: { request: { method: 'POST', url: '/v1/provenance/certificate' } },
          },
          {
            name: 'QR Code',
            value: 'qr',
            action: 'Render a QR code',
            description: 'Crisp deterministic QR SVG from any text or URL ($0.002/call)',
            routing: { request: { method: 'GET', url: '/v1/qr' } },
          },
          {
            name: 'Route Price',
            value: 'routePrice',
            action: 'Get a live token price',
            description:
              'Live crypto/token spot price routed to the best live x402 provider, normalized ($0.03/call)',
            routing: { request: { method: 'GET', url: '/v1/route/price' } },
          },
          {
            name: 'Social Card',
            value: 'ogImage',
            action: 'Render a social card image',
            description:
              'Deterministic 1200x630 Open Graph SVG from a title and optional subtitle ($0.01/call)',
            routing: { request: { method: 'GET', url: '/v1/og-image' } },
          },
          {
            name: 'Visual Review',
            value: 'visualReview',
            action: 'Screenshot and audit a page',
            description:
              'Full-page screenshot from a real browser plus an axe-core accessibility audit ($0.01/call)',
            routing: { request: { method: 'POST', url: '/v1/visual-review' } },
          },
          {
            name: 'Wallet Screen',
            value: 'walletScreen',
            action: 'Screen a wallet for sanctions',
            description:
              'Deterministic read of the public Chainalysis sanctions oracle for an EVM address ($0.05/call)',
            routing: { request: { method: 'GET', url: '/v1/wallet/screen' } },
          },
          {
            name: 'X402 Audit',
            value: 'x402Audit',
            action: 'Audit an x402 counter',
            description:
              'Weigh any x402 counter: 402 coherence, discovery metadata validity, and index listing ($0.25/call)',
            routing: { request: { method: 'POST', url: '/v1/x402-audit' } },
          },
          // The counter's send-sms SKU (POST /v1/sms) is deliberately NOT an
          // operation here: real carrier cash + TCPA/10DLC exposure make it an
          // abuse magnet through a broad automation surface. This exclusion is
          // intentional and pinned by this package's smoke test.
        ],
      },
      ...chartFields,
      ...ephemeralDbFields,
      ...socialCardFields,
      ...phoneIntelFields,
      ...provenanceFields,
      ...qrFields,
      ...routePriceFields,
      ...visualReviewFields,
      ...walletScreenFields,
      ...x402AuditFields,
    ],
  };
}
