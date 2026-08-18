import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  Icon,
  INodeProperties,
} from 'n8n-workflow';

/**
 * MimirAPI credential. MimirAPI has no API key and no signup — payment is
 * x402, per call. Free surfaces (Catalog, Health) need nothing; leave the
 * payment signature blank for those. A paid SKU answers HTTP 402 with an x402
 * challenge (USDC on Base); settle it with your wallet and paste the resulting
 * `PAYMENT-SIGNATURE` header value here to retry the same call paid.
 */
export class MimirApiApi implements ICredentialType {
  name = 'mimirApiApi';

  displayName = 'MimirAPI API';

  documentationUrl = 'https://mimirapi.com/llms.txt';

  icon: Icon = {
    light: 'file:../nodes/MimirApi/mimirapi.svg',
    dark: 'file:../nodes/MimirApi/mimirapi.dark.svg',
  };

  properties: INodeProperties[] = [
    {
      displayName: 'Payment Signature',
      name: 'paymentSignature',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description:
        'Value for the x402 PAYMENT-SIGNATURE header on paid calls. Leave blank for free operations (Catalog, Health) or to receive the 402 challenge a paid SKU quotes; settle the challenge with your wallet (USDC on Base) and paste the signature here.',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://mimirapi.com',
      description: 'Override the API base URL. Leave as-is unless you were told otherwise.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'PAYMENT-SIGNATURE': '={{$credentials.paymentSignature}}',
      },
    },
  };

  // Free liveness surface — works with a blank payment signature, so the
  // credential test never spends money.
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl || "https://mimirapi.com"}}',
      url: '/health',
    },
  };
}
