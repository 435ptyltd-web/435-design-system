import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  sourcemap: true,
});

await build({
  entryPoints: ['src/styles.css'],
  outfile: 'dist/styles.css',
  bundle: true,
  loader: { '.css': 'css' },
});

execSync('npx tsc --emitDeclarationOnly', { stdio: 'inherit' });

console.log('Build complete: dist/index.js, dist/styles.css, dist/index.d.ts');
