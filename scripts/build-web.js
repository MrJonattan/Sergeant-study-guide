#!/usr/bin/env node
/**
 * Build script for web app - uses @nypd-sergeant/core package
 * This is a thin wrapper around the core build pipeline
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { build } = await import('../packages/core/dist/builder.js');

const PROJECT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT, 'build');

// Build using core package
const studyData = build({
  projectRoot: PROJECT,
  outputDir: OUTPUT_DIR,
  format: 'js' // Output both JSON and JS for web compatibility
});

console.log('\nBuild complete!');
console.log(`Output: ${OUTPUT_DIR}/data.js`);
