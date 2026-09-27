import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { MimirApiApi } from '../credentials/MimirApiApi.credentials';
import { MimirApi } from '../nodes/MimirApi/MimirApi.node';

/**
 * Property suite for the declarative MimirAPI node (testing assembly line 4c).
 *
 * The smoke test pins today's exact operation list and a few specific routes.
 * This suite pins the *laws* that must hold across EVERY operation and field the
 * node will ever declare — the invariants a future edit is most likely to break
 * silently:
 *
 *  - Totality: every operation the picker offers resolves to a well-formed REST
 *    request (a known method + a relative path), so n8n can never select an
 *    operation that routes nowhere.
 *  - Referential integrity: every field is gated to declared operations and
 *    lands somewhere on the wire — no orphan field pointing at a typo'd
 *    operation, no user input silently dropped before the request.
 *  - Trust boundary: the send-sms surface (real carrier cash + TCPA/10DLC
 *    exposure) stays out of the node no matter how an SMS route is spelled. This
 *    is the one exclusion the node comments call out by name; a law, not a
 *    coincidence of the current option array.
 *  - Domain rule: no operation and no default base URL ever ships a
 *    `workers.dev` origin to a user (CLAUDE.md §15).
 *
 * fast-check quantifies each law over the node's own finite declared domain and
 * shrinks any future violation to a minimal counterexample.
 */

// Minimal structural views of the declarative shapes we assert over. The node
// source is authoritative; these keep the test readable without importing the
// full n8n property union (the test dir is transpiled by vitest, not typechecked
// by the package `tsc`, so a narrow local view is the honest surface).
interface OperationOption {
  name?: string;
  value?: unknown;
  action?: string;
  description?: string;
  routing?: { request?: { method?: string; url?: string } };
}
interface FieldProperty {
  name?: string;
  displayName?: string;
  displayOptions?: { show?: { operation?: unknown[] } };
  routing?: { send?: { type?: string; property?: string } };
}

const { description } = new MimirApi();

const operationProp = description.properties.find((p) => p.name === 'operation');
const operationOptions = (operationProp?.options ?? []) as OperationOption[];
const operationValues = operationOptions
  .map((o) => o.value)
  .filter((v): v is string => typeof v === 'string');

// Field groups are every non-operation property; each is gated to an operation
// via `displayOptions.show.operation`.
const fieldProps = description.properties.filter(
  (p) => p.name !== 'operation',
) as FieldProperty[];

// Free, never-metered discovery surfaces (Catalog, Health). `ping` is a PAID
// liveness probe, not free — it is deliberately excluded here.
const FREE_OPERATIONS: Record<string, { method: string; url: string }> = {
  catalog: { method: 'GET', url: '/v1/catalog' },
  health: { method: 'GET', url: '/health' },
};

// Operations that take no user input — the discovery surfaces plus the paid
// `ping` probe. Everything else must carry at least one field group.
const PARAMETERLESS_OPERATIONS = ['catalog', 'health', 'ping'];

const byOperationValue = new Map(operationOptions.map((o) => [o.value, o]));

const anyOperation = () => fc.constantFrom(...operationValues);
const anyField = () => fc.constantFrom(...fieldProps);

describe('MimirAPI node — declared domain is non-empty', () => {
  it('exposes an operation picker and field groups to quantify over', () => {
    expect(operationValues.length).toBeGreaterThan(0);
    expect(fieldProps.length).toBeGreaterThan(0);
    // Values are unique, so the picker→route lookup is a total function.
    expect(new Set(operationValues).size).toBe(operationValues.length);
  });
});

describe('MimirAPI node — operation totality laws', () => {
  it('every operation routes to a well-formed relative REST request', () => {
    fc.assert(
      fc.property(anyOperation(), (value) => {
        const option = byOperationValue.get(value);
        const request = option?.routing?.request;
        expect(request).toBeDefined();
        expect(['GET', 'POST']).toContain(request?.method);
        const url = request?.url ?? '';
        // A relative path the requestDefaults.baseURL can prefix — never an
        // absolute origin, never a whitespace-broken route.
        expect(url.startsWith('/')).toBe(true);
        expect(url).not.toMatch(/\s/);
        expect(url).not.toMatch(/^https?:\/\//i);
      }),
    );
  });

  it('every operation carries the human-facing metadata n8n renders', () => {
    fc.assert(
      fc.property(anyOperation(), (value) => {
        const option = byOperationValue.get(value);
        expect(typeof option?.name).toBe('string');
        expect((option?.name ?? '').length).toBeGreaterThan(0);
        expect((option?.action ?? '').length).toBeGreaterThan(0);
        expect((option?.description ?? '').length).toBeGreaterThan(0);
      }),
    );
  });
});

describe('MimirAPI node — field ↔ operation referential integrity', () => {
  it('every field is gated only to declared operations', () => {
    fc.assert(
      fc.property(anyField(), (field) => {
        const gatedTo = field.displayOptions?.show?.operation ?? [];
        expect(Array.isArray(gatedTo)).toBe(true);
        expect(gatedTo.length).toBeGreaterThan(0);
        for (const op of gatedTo) {
          expect(operationValues).toContain(op);
        }
      }),
    );
  });

  it('every field lands on the wire as a body or query parameter', () => {
    fc.assert(
      fc.property(anyField(), (field) => {
        const send = field.routing?.send;
        expect(send).toBeDefined();
        expect(['body', 'query']).toContain(send?.type);
        expect((send?.property ?? '').length).toBeGreaterThan(0);
      }),
    );
  });

  it('field names are unique within each operation n8n renders', () => {
    fc.assert(
      fc.property(anyOperation(), (value) => {
        const names = fieldProps
          .filter((f) => (f.displayOptions?.show?.operation ?? []).includes(value))
          .map((f) => f.name);
        expect(new Set(names).size).toBe(names.length);
      }),
    );
  });
});

describe('MimirAPI node — parameter presence coherence', () => {
  it('an operation has field groups iff it is not a parameterless surface', () => {
    fc.assert(
      fc.property(anyOperation(), (value) => {
        const hasFields = fieldProps.some((f) =>
          (f.displayOptions?.show?.operation ?? []).includes(value),
        );
        const isParameterless = PARAMETERLESS_OPERATIONS.includes(value);
        expect(hasFields).toBe(!isParameterless);
      }),
    );
  });

  it('free discovery surfaces stay pinned to their never-metered GET routes', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(FREE_OPERATIONS)), (value) => {
        const request = byOperationValue.get(value)?.routing?.request;
        expect(request).toMatchObject(FREE_OPERATIONS[value]);
      }),
    );
  });
});

describe('MimirAPI node — trust boundary + domain laws', () => {
  const serialized = JSON.stringify(description).toLowerCase();

  it('never exposes a send-sms surface, however the route is spelled', () => {
    // The one exclusion the node names explicitly: broad SMS automation carries
    // carrier cash and TCPA/10DLC exposure. No spelling of it may leak into a
    // route, an operation value, or a field.
    fc.assert(
      fc.property(fc.constantFrom('/v1/sms', '/sms', 'send-sms', 'sendsms', 'sms'), (token) => {
        expect(serialized).not.toContain(`"${token}"`);
      }),
    );
    // Belt and braces: no operation value or request URL is an SMS route.
    for (const value of operationValues) {
      expect(value.toLowerCase()).not.toContain('sms');
      const url = (byOperationValue.get(value)?.routing?.request?.url ?? '').toLowerCase();
      expect(url).not.toContain('sms');
    }
  });

  it('no operation route and no default base URL ships a workers.dev origin', () => {
    const baseUrl = String(description.requestDefaults?.baseURL ?? '');
    expect(baseUrl).toContain('mimirapi.com');
    expect(baseUrl).not.toContain('workers.dev');
    fc.assert(
      fc.property(anyOperation(), (value) => {
        const url = byOperationValue.get(value)?.routing?.request?.url ?? '';
        expect(url).not.toContain('workers.dev');
      }),
    );
  });
});

describe('MimirApiApi credential — free surfaces never require payment', () => {
  const credential = new MimirApiApi();
  const propsByName = new Map(credential.properties.map((p) => [p.name, p]));

  it('keeps the payment signature masked and optional', () => {
    const signature = propsByName.get('paymentSignature');
    // Masked so a settlement signature is never rendered in plain text…
    expect(signature?.typeOptions?.password).toBe(true);
    // …and optional, so Catalog/Health work with no wallet attached.
    expect(signature?.required).toBeUndefined();
  });

  it('sends the settlement only through the PAYMENT-SIGNATURE header', () => {
    const header = credential.authenticate.properties?.headers?.['PAYMENT-SIGNATURE'];
    expect(header).toContain('$credentials.paymentSignature');
    // The signature is never smuggled into the URL or query string.
    expect(JSON.stringify(credential.authenticate)).not.toContain('qs');
  });
});
