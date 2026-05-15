#!/usr/bin/env node
/**
 * Build script for web app - uses @nypd-sergeant/core package
 * This is a thin wrapper around the core build pipeline
 */
const path = require('path');
const { build } = require('../packages/core/dist/builder');

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
