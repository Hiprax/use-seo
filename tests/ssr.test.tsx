/**
 * @jest-environment node
 *
 * SSR (Server-Side Rendering) safety tests.
 *
 * This file deliberately runs under the `node` Jest environment (NOT jsdom)
 * so that `typeof window === 'undefined'` and `typeof document === 'undefined'`
 * at the top level — exactly what a Next.js / Remix / Astro server render
 * looks like. The hook and every DOM helper must behave as a no-op in this
 * environment instead of crashing with a `ReferenceError: document is not
 * defined`.
 *
 * Tests cover:
 *   - `canUseDOM()` returns `false` in a node environment.
 *   - The DOM helpers (`createMeta`, `getOrCreateMeta`, `getOrCreateLink`,
 *     `removeMarkedElements`, `ensureEssentialMeta`, `createJsonLdScript`)
 *     each no-op or return safely without touching globals that don't exist.
 *   - `useSEO()` itself can be invoked through `renderToString` from
 *     `react-dom/server` without throwing, and its returned methods
 *     (`updateMetaTag`, `updateLinkTag`, `clearSEOTags`, `getCurrentSEO`) are
 *     safe to call during the render.
 */

import * as React from 'react';
import { renderToString } from 'react-dom/server';

import { useSEO } from '../src/useSEO';
import {
  canUseDOM,
  createJsonLdScript,
  createMeta,
  ensureEssentialMeta,
  getOrCreateLink,
  getOrCreateMeta,
  removeMarkedElements,
  resetCanUseDOMCache,
} from '../src/utils/dom';

beforeEach(() => {
  // Force a cold read of the `typeof window`/`typeof document` checks for
  // every test in this file. The cache lives at module scope so without this
  // a previous test's result would mask later ones.
  resetCanUseDOMCache();
});

describe('canUseDOM in a node environment (no window, no document)', () => {
  it('returns false when neither window nor document are defined', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(canUseDOM()).toBe(false);
  });

  it('caches the false result across calls (no repeated typeof checks)', () => {
    const first = canUseDOM();
    const second = canUseDOM();
    const third = canUseDOM();
    expect(first).toBe(false);
    expect(second).toBe(false);
    expect(third).toBe(false);
  });
});

describe('DOM helpers are no-ops in SSR (canUseDOM === false)', () => {
  it('removeMarkedElements is a safe no-op', () => {
    expect(() => removeMarkedElements('meta[name="x"]')).not.toThrow();
  });

  it('removeMarkedElements with a tracking Set leaves the Set untouched', () => {
    // The Set carries placeholder entries that look like Elements but won't
    // be inspected because the function bails before touching `document`.
    const tracked = new Set<Element>();
    const fakeEl = { tagName: 'META' } as unknown as Element;
    tracked.add(fakeEl);
    expect(() => removeMarkedElements('meta[name="x"]', tracked)).not.toThrow();
    // The Set is untouched because the helper returned before iterating.
    expect(tracked.size).toBe(1);
    expect(tracked.has(fakeEl)).toBe(true);
  });

  it('ensureEssentialMeta is a safe no-op (does not touch document.head)', () => {
    const tracked = new Set<Element>();
    expect(() => ensureEssentialMeta(tracked)).not.toThrow();
    expect(tracked.size).toBe(0);
  });

  it('createMeta throws ReferenceError instead of silently corrupting state', () => {
    // `createMeta` is a low-level building block that the hook only calls
    // after a successful `canUseDOM()` check. In SSR it should never be
    // reached. We document the runtime behavior here so a future contributor
    // doesn't accidentally try to call it on the server: it must throw a
    // `ReferenceError` (because `document` is undefined) — this is the
    // tripwire that protects callers from getting a silent no-op when they
    // are clearly in the wrong environment.
    expect(() => createMeta({ name: 'x' })).toThrow(ReferenceError);
  });

  it('getOrCreateMeta returns null for an empty key without touching document', () => {
    // Empty-key short-circuit fires BEFORE the `document` access, so this is
    // a defined behavior in SSR and proves the early-exit ordering.
    expect(getOrCreateMeta({}, true)).toBeNull();
    expect(
      getOrCreateMeta({ name: '', property: '', httpEquiv: '' }, true)
    ).toBeNull();
  });

  it('getOrCreateMeta with a real key throws ReferenceError (document missing)', () => {
    // Same rationale as createMeta: a non-empty key means the helper WILL
    // try to query the document. In SSR this surfaces as ReferenceError so
    // callers get a loud failure instead of corrupted state.
    expect(() => getOrCreateMeta({ name: 'description' }, true)).toThrow(
      ReferenceError
    );
  });

  it('getOrCreateLink throws ReferenceError (document missing)', () => {
    expect(() => getOrCreateLink('canonical', true)).toThrow(ReferenceError);
  });

  it('createJsonLdScript with invalid data returns null without touching document', () => {
    // The early-return for invalid data fires BEFORE document access, so
    // these are safe to call in SSR.
    expect(createJsonLdScript(null as unknown as object, 0)).toBeNull();
    expect(createJsonLdScript(undefined as unknown as object, 0)).toBeNull();
    expect(createJsonLdScript('str' as unknown as object, 0)).toBeNull();
  });
});

describe('useSEO in a server render (renderToString) is a no-op', () => {
  it('renders without throwing when used inside a component', () => {
    function Page(): React.ReactElement {
      useSEO({
        title: 'Server Page',
        description: 'A page rendered on the server',
        canonical: 'https://example.com/server',
        ogImages: [
          { url: 'https://example.com/og.jpg', width: 1200, height: 630 },
        ],
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Server Page',
        },
      });
      return React.createElement('div', null, 'hello');
    }

    let html = '';
    expect(() => {
      html = renderToString(React.createElement(Page));
    }).not.toThrow();
    // The component still renders its own JSX.
    expect(html).toContain('hello');
  });

  it('returned methods are safe to invoke during server render', () => {
    // The hook's returned object exposes four methods. Each MUST short-circuit
    // when `canUseDOM()` is false so that a caller doing
    // `const { updateMetaTag } = useSEO(); updateMetaTag(...)` during render
    // doesn't crash the SSR pipeline.
    let captured: ReturnType<typeof useSEO> | null = null;

    function Page(): React.ReactElement {
      const api = useSEO({ title: 'srv' });
      captured = api;
      api.updateMetaTag({ name: 'description' }, 'srv-desc');
      api.updateMetaTag({ property: 'og:title' }, 'srv-og');
      api.updateLinkTag('canonical', 'https://example.com/srv');
      api.clearSEOTags();
      // getCurrentSEO is pure (just reads a ref), so it should always work
      // and return an object snapshot — empty here because the effect never
      // ran on the server.
      const snapshot = api.getCurrentSEO();
      expect(snapshot).toEqual({});
      return React.createElement('div', null, 'srv');
    }

    expect(() => renderToString(React.createElement(Page))).not.toThrow();
    expect(captured).not.toBeNull();
  });

  it('multiple renders in the same SSR pass do not interfere with each other', () => {
    // Simulate rendering a list of pages on the server (e.g., a sitemap or
    // an SSG export step). Each instance should be isolated and silent.
    function ItemPage({ id }: { id: number }): React.ReactElement {
      useSEO({
        title: `Item ${id}`,
        description: `Description for item ${id}`,
        canonical: `https://example.com/items/${id}`,
      });
      return React.createElement('li', null, `item-${id}`);
    }

    function List(): React.ReactElement {
      return React.createElement(
        'ul',
        null,
        [1, 2, 3, 4, 5].map((id) =>
          React.createElement(ItemPage, { key: id, id })
        )
      );
    }

    let html = '';
    expect(() => {
      html = renderToString(React.createElement(List));
    }).not.toThrow();
    expect(html).toContain('item-1');
    expect(html).toContain('item-5');
  });

  it('renderToString with clearOnUnmount: true is a safe no-op (cleanup never fires on the server)', () => {
    // Mount/unmount lifecycle on the server boils down to one renderToString
    // pass: React `useEffect` (and its cleanup) does NOT run during
    // `renderToString`, so the `clearOnUnmount` cleanup branch is structurally
    // unreachable on the server. This test pins down two guarantees:
    //
    //   1. Passing `clearOnUnmount: true` in the props during SSR does not
    //      throw and does not corrupt the render output (the component still
    //      emits its JSX as expected).
    //   2. The hook's returned API remains intact — `clearSEOTags()` is the
    //      imperative twin of the prop, and calling it explicitly during the
    //      server render must also be a safe no-op (it short-circuits via the
    //      `canUseDOM()` guard before touching `document`).
    //
    // Together with the existing `cleanup is guarded by canUseDOM()` source
    // comment, this closes the documentation gap noted in FIX.md L8: even if
    // a future React renderer were to start firing effect cleanups during
    // SSR (it does not today), the hook would still no-op cleanly.
    function Page(): React.ReactElement {
      const api = useSEO({
        title: 'Server Page',
        description: 'A page rendered on the server with clearOnUnmount: true',
        canonical: 'https://example.com/server-cleanup',
        ogImages: [
          { url: 'https://example.com/og.jpg', width: 1200, height: 630 },
        ],
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Server Page',
        },
        clearOnUnmount: true,
      });
      // The imperative cleanup must also be safe to call during server render.
      api.clearSEOTags();
      return React.createElement('div', null, 'cleanup-page');
    }

    let html = '';
    expect(() => {
      html = renderToString(React.createElement(Page));
    }).not.toThrow();
    expect(html).toContain('cleanup-page');
  });
});
