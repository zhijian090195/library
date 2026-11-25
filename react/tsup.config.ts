import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/fx.ts'],
  format: ['esm', 'cjs'],
  // fx 的型別從 fx-api.ts 產生，避免把 aicde-fx.js 原始碼塞進 .d.ts
  dts: { entry: { index: 'src/index.ts', fx: 'src/fx-api.ts' } },
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  banner: { js: '"use client";' },
  target: 'es2019'
});
