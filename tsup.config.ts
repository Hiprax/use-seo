import { defineConfig, type Plugin } from 'tsup';

/**
 * tsup plugin that fixes the CJS bundle's default-export ergonomics.
 *
 * Without this, `require('@hiprax/use-seo')` returns the namespace object
 * (`{ default, useSEO, DEFAULT_OG_TYPE, ... }`) so the function is hidden
 * behind `.default`. This plugin appends a small footer that swaps
 * `module.exports` to the default export and re-attaches every named
 * export as a property on the function, so both of these CJS patterns work:
 *
 *   const useSEO = require('@hiprax/use-seo');                       // function
 *   const { useSEO, DEFAULT_OG_TYPE } = require('@hiprax/use-seo');  // named
 *
 * tsup's built-in `cjsInterop: true` is not usable here because it only fires
 * when the entry chunk has a single `default` export — our entry intentionally
 * exposes both default and named exports for ESM consumers.
 */
const cjsDefaultExportInterop = (): Plugin => ({
  name: 'cjs-default-export-interop',
  renderChunk(code, info) {
    if (
      this.format !== 'cjs' ||
      info.type !== 'chunk' ||
      !/\.cjs$/.test(info.path) ||
      !info.entryPoint
    ) {
      return;
    }
    // Strip a trailing sourcemap comment so we can append safely, then re-add it.
    const sourceMapMatch = code.match(/\n?\/\/[#@]\s*sourceMappingURL=.*$/);
    const sourceMapComment = sourceMapMatch ? sourceMapMatch[0] : '';
    const body = sourceMapComment
      ? code.slice(0, code.length - sourceMapComment.length)
      : code;
    // After this footer runs:
    //   require('@hiprax/use-seo')          -> the useSEO function
    //   require('@hiprax/use-seo').useSEO   -> the useSEO function (named)
    //   require('@hiprax/use-seo').default  -> the useSEO function (default re-attached)
    //   require('@hiprax/use-seo').DEFAULT_OG_TYPE  -> 'website'
    const footer = [
      ';(function(){',
      'var __ns=module.exports;',
      'if(__ns&&typeof __ns==="object"&&typeof __ns.default!=="undefined"){',
      'var __def=__ns.default;',
      'module.exports=__def;',
      'for(var __k in __ns){',
      'if(__k!=="default"&&Object.prototype.hasOwnProperty.call(__ns,__k)){',
      'try{module.exports[__k]=__ns[__k];}catch(e){}',
      '}',
      '}',
      'try{module.exports.default=__def;}catch(e){}',
      '}',
      '})();',
    ].join('');
    const patched = body + '\n' + footer + sourceMapComment;
    return { code: patched, map: info.map };
  },
});

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  // `treeshake: true` would run an extra Rollup pass on top of esbuild's own
  // tree-shaking. Beyond being redundant, that Rollup pass emits a spurious
  // MIXED_EXPORTS warning ("Entry module ... is using named and default
  // exports together") for our intentionally-mixed entry. esbuild already
  // tree-shakes, so this is a no-op for bundle size.
  treeshake: false,
  // Align with tsconfig.json `compilerOptions.target` so the emitted JS uses
  // the same language level as type-check. The hook itself imports from
  // 'react' (useCallback/useEffect/useRef); it does NOT import 'react-dom',
  // so listing 'react-dom' as external would be misleading. It remains a
  // peerDependency for consumers that render React trees (which is everyone).
  target: 'es2018',
  external: ['react'],
  plugins: [cjsDefaultExportInterop()],
  outExtension({ format }) {
    // ESM gets the explicit `.mjs` extension so Node always treats it as
    // an ES module regardless of the consumer's package.json `"type"`
    // field. Without this, an ambient `.js` ESM bundle in a package that
    // does NOT declare `"type": "module"` is parsed by Node as CJS and
    // crashes with `SyntaxError: Cannot use import statement outside a
    // module`. CJS keeps `.cjs` for the symmetric reason.
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
});

