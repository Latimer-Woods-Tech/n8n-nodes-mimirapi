import { describe, expect, it } from 'vitest';

import { MimirApiApi } from '../credentials/MimirApiApi.credentials';
import { MimirApi } from '../nodes/MimirApi/MimirApi.node';

/**
 * Smoke test (testing assembly line 2b onboarding): proves the declarative
 * MimirAPI node + credential load and expose the wiring n8n relies on, with
 * no network. This lands a coverage row in studio_coverage so the ratchet has
 * a package to track; deeper per-operation tests raise the floor later.
 */
describe('MimirApi node', () => {
  const node = new MimirApi();
  const { description } = node;

  it('declares the node identity n8n loads by', () => {
    expect(description.name).toBe('mimirApi');
    expect(description.displayName).toBe('MimirAPI');
    expect(description.version).toBe(1);
    expect(description.inputs).toEqual(['main']);
    expect(description.outputs).toEqual(['main']);
  });

  it('requires the mimirApiApi credential and defaults its base URL', () => {
    expect(description.credentials).toEqual([{ name: 'mimirApiApi', required: true }]);
    expect(description.requestDefaults?.baseURL).toContain('https://mimirapi.com');
  });

  it('exposes the two free surfaces plus one operation per paid SKU family (no SMS)', () => {
    const operation = description.properties.find((p) => p.name === 'operation');
    expect(operation).toBeDefined();
    const values = (operation?.options ?? []).map((o) => 'value' in o && o.value);
    expect(values).toEqual([
      'catalog',
      'chart',
      'ephemeralDb',
      'health',
      'phoneIntel',
      'ping',
      'provenanceCert',
      'qr',
      'routePrice',
      'ogImage',
      'visualReview',
      'walletScreen',
      'x402Audit',
    ]);
    for (const option of operation?.options ?? []) {
      // Every operation maps to a REST endpoint via declarative routing.
      expect('routing' in option && option.routing?.request?.url).toBeTruthy();
    }
    // send-sms is deliberately not exposed as an operation.
    expect(JSON.stringify(description.properties)).not.toContain('/v1/sms');
  });

  it('routes the free surfaces to the never-metered discovery endpoints', () => {
    const operation = description.properties.find((p) => p.name === 'operation');
    const byValue = new Map(
      (operation?.options ?? []).map((o) => ['value' in o ? o.value : '', o]),
    );
    expect(byValue.get('catalog')?.routing?.request).toMatchObject({
      method: 'GET',
      url: '/v1/catalog',
    });
    expect(byValue.get('health')?.routing?.request).toMatchObject({
      method: 'GET',
      url: '/health',
    });
  });

  it('parses the comma-separated chart series into a numeric array expression', () => {
    const values = description.properties.find((p) => p.name === 'values');
    expect(values?.routing?.send?.property).toBe('values');
    expect(values?.routing?.send?.value).toContain('Number');
  });
});

describe('MimirApiApi credential', () => {
  const credential = new MimirApiApi();

  it('is keyed as mimirApiApi with a masked, optional payment signature', () => {
    expect(credential.name).toBe('mimirApiApi');
    const signature = credential.properties.find((p) => p.name === 'paymentSignature');
    expect(signature?.typeOptions?.password).toBe(true);
    // Free surfaces need no payment, so the signature is not required.
    expect(signature?.required).toBeUndefined();
  });

  it('sends the x402 settlement as a PAYMENT-SIGNATURE header', () => {
    const header = credential.authenticate.properties?.headers?.['PAYMENT-SIGNATURE'];
    expect(header).toContain('$credentials.paymentSignature');
  });
});
