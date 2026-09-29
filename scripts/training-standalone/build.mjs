/**
 * Builds the training module as a static page: prototype/training/{index.html,app.js,app.css}.
 *
 * Why a separate build: the Next.js app cannot be deployed yet (it needs Supabase
 * configuration and has pre-existing type errors outside this module), but the
 * training module is self-contained client code. Bundling it on its own lets it
 * ship on the static site today, from the very same components and engines.
 *
 *   npm run build:training
 */
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const out = path.join(root, 'prototype', 'training');
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [path.join(here, 'entry.tsx')],
  outfile: path.join(out, 'app.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  alias: { '@': path.join(root, 'src') },
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
  // 'use client' directives are meaningless outside Next; silence the notice.
  logOverride: { 'module-level-directive': 'silent' },
});

execFileSync(
  path.join(root, 'node_modules', '.bin', 'tailwindcss'),
  ['-c', path.join(here, 'tailwind.config.cjs'), '-i', path.join(here, 'styles.css'), '-o', path.join(out, 'app.css'), '--minify'],
  { stdio: 'inherit' },
);

const version = Date.now().toString(36);
writeFileSync(path.join(out, 'index.html'), readFileSync(path.join(here, 'index.html'), 'utf8').replaceAll('__VERSION__', version));
console.log('training page built →', path.relative(root, out));
