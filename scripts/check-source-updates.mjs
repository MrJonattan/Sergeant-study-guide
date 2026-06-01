#!/usr/bin/env node
/**
 * check-source-updates.mjs
 *
 * Detects changes in NYPD Department Manual source PDFs by comparing content hashes.
 * Source: https://www.nyc.gov/site/nypd/about/about-nypd/manual.page
 *
 * Usage: node scripts/check-source-updates.mjs
 * Exit codes:
 *   0 - No changes detected
 *   1 - Changes detected (or error)
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, '..', 'source-manifest.json');

const PDF_FILES = [
  { name: 'toc1.pdf', description: 'Table of Contents' },
  { name: 'public-pguide1.pdf', description: 'Patrol Guide Part 1' },
  { name: 'public-pguide2.pdf', description: 'Patrol Guide Part 2' },
  { name: 'public-pguide3.pdf', description: 'Patrol Guide Part 3' },
  { name: 'public-pguide4.pdf', description: 'Patrol Guide Part 4' },
  { name: 'public-adminguide1.pdf', description: 'Admin Guide Part 1' },
  { name: 'public-adminguide2.pdf', description: 'Admin Guide Part 2' },
];

const UPDATE_PDF = { name: 'Update1.pdf', description: 'Department Manual Update Timeline' };

const MANUAL_PAGE_URL = 'https://www.nyc.gov/site/nypd/about/about-nypd/manual.page';
const BASE_DOWNLOAD_URL = 'https://www.nyc.gov/assets/nypd/downloads/pdf/public_information';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Fetch a URL and return the response body as text
 */
async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/**
 * Fetch a URL and return the response as an ArrayBuffer
 */
async function fetchArrayBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/pdf,*/*',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}

/**
 * Fetch PDF metadata (HEAD request)
 */
async function fetchPdfMetadata(url) {
  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/pdf',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response;
}

/**
 * Compute SHA256 hash of a buffer
 */
function computeSha256(buffer) {
  const hash = createHash('sha256');
  hash.update(Buffer.from(buffer));
  return hash.digest('hex');
}

/**
 * Extract "Last Updated" date from the manual page HTML
 */
function extractLastUpdated(html) {
  // Look for patterns like "Last Updated May 19, 2026" or "Last updated on May 19, 2026"
  const patterns = [
    /Last\s+Updated\s+<[^>]*>([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /Last\s+Updated[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /Last\s+updated\s+on[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /Updated[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Fetch PDF metadata and compute hash
 */
async function fetchPdfInfo(url) {
  const response = await fetchPdfMetadata(url);

  const contentLength = response.headers.get('content-length');
  const lastModified = response.headers.get('last-modified');

  // Now fetch the actual content for hashing
  const arrayBuffer = await fetchArrayBuffer(url);
  const sha256 = computeSha256(arrayBuffer);

  return {
    sha256,
    contentLength: contentLength ? parseInt(contentLength, 10) : null,
    lastModified: lastModified || null,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Fetch Update1.pdf and extract text content (simplified - just note the hash change)
 */
async function fetchUpdateTimeline(url) {
  try {
    const arrayBuffer = await fetchArrayBuffer(url);
    return {
      sha256: computeSha256(arrayBuffer),
      fetched: true,
    };
  } catch (error) {
    // Update1.pdf might not exist yet
    return {
      sha256: null,
      fetched: false,
      error: error.message,
    };
  }
}

/**
 * Load existing manifest or return null
 */
function loadManifest() {
  try {
    const content = readFileSync(MANIFEST_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Parse date string from manifest or page
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  // Handle ISO strings
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  // Handle "May 19, 2026" format
  return new Date(dateStr);
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = parseDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toISOString().split('T')[0];
}

/**
 * Main check function
 */
async function checkForUpdates() {
  console.log('🔍 NYPD Department Manual Source Check');
  console.log('=====================================');
  console.log(`Source: ${MANUAL_PAGE_URL}`);
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
  console.log('');

  // Load existing manifest
  const oldManifest = loadManifest();
  if (!oldManifest) {
    console.log('⚠️  No existing manifest found. Creating new baseline.');
    console.log('');
  }

  // Fetch the manual page
  console.log('📄 Fetching manual page...');
  let pageHtml;
  try {
    pageHtml = await fetchText(MANUAL_PAGE_URL);
  } catch (error) {
    console.error(`❌ Failed to fetch manual page: ${error.message}`);
    process.exit(1);
  }

  const pageLastUpdated = extractLastUpdated(pageHtml);
  console.log(`   Page "Last Updated": ${pageLastUpdated || 'Not found'}`);
  console.log('');

  const changes = [];
  const newManifest = {
    $schema: 'NYPD Manual Source Manifest',
    generatedAt: new Date().toISOString(),
    sourceUrl: MANUAL_PAGE_URL,
    downloadBaseUrl: BASE_DOWNLOAD_URL,
    pageLastUpdated: pageLastUpdated,
    pdfs: {},
    updateTimeline: null,
  };

  // Check each PDF
  console.log('📋 Checking PDF files...');
  for (const pdf of PDF_FILES) {
    const url = `${BASE_DOWNLOAD_URL}/${pdf.name}`;
    console.log(`   Checking ${pdf.name}...`);

    try {
      const info = await fetchPdfInfo(url);
      newManifest.pdfs[pdf.name] = {
        url,
        description: pdf.description,
        ...info,
      };

      // Compare with old manifest
      if (oldManifest && oldManifest.pdfs && oldManifest.pdfs[pdf.name]) {
        const old = oldManifest.pdfs[pdf.name];
        if (old.sha256 !== info.sha256) {
          changes.push({
            file: pdf.name,
            type: 'content_changed',
            description: pdf.description,
            oldHash: old.sha256,
            newHash: info.sha256,
            oldSize: old.contentLength,
            newSize: info.contentLength,
          });
          console.log(`   ⚠️  CHANGED: ${pdf.name}`);
        } else {
          console.log(`   ✓ Unchanged: ${pdf.name}`);
        }
      } else {
        console.log(`   🆕 New file: ${pdf.name}`);
        changes.push({
          file: pdf.name,
          type: 'new_file',
          description: pdf.description,
          newHash: info.sha256,
          newSize: info.contentLength,
        });
      }
    } catch (error) {
      console.error(`   ❌ Error fetching ${pdf.name}: ${error.message}`);
      newManifest.pdfs[pdf.name] = {
        url,
        description: pdf.description,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  console.log('');

  // Check Update1.pdf (timeline)
  console.log('📋 Checking Update Timeline (Update1.pdf)...');
  const updateUrl = `${BASE_DOWNLOAD_URL}/${UPDATE_PDF.name}`;
  const updateInfo = await fetchUpdateTimeline(updateUrl);

  if (updateInfo.fetched) {
    newManifest.updateTimeline = {
      url: updateUrl,
      sha256: updateInfo.sha256,
      lastChecked: new Date().toISOString(),
    };

    if (oldManifest && oldManifest.updateTimeline) {
      if (oldManifest.updateTimeline.sha256 !== updateInfo.sha256) {
        changes.push({
          file: UPDATE_PDF.name,
          type: 'timeline_updated',
          description: UPDATE_PDF.description,
          oldHash: oldManifest.updateTimeline.sha256,
          newHash: updateInfo.sha256,
        });
        console.log(`   ⚠️  CHANGED: ${UPDATE_PDF.name}`);
      } else {
        console.log(`   ✓ Unchanged: ${UPDATE_PDF.name}`);
      }
    } else {
      console.log(`   🆕 New file: ${UPDATE_PDF.name}`);
      changes.push({
        file: UPDATE_PDF.name,
        type: 'new_file',
        description: UPDATE_PDF.description,
        newHash: updateInfo.sha256,
      });
    }
  } else {
    console.log(`   ℹ️  Update1.pdf not found (this is normal if no updates yet)`);
    newManifest.updateTimeline = {
      url: updateUrl,
      available: false,
      lastChecked: new Date().toISOString(),
    };
  }

  console.log('');
  console.log('=====================================');
  console.log('📊 SUMMARY');
  console.log('=====================================');

  if (changes.length === 0) {
    console.log('✅ No changes detected. All PDFs match the live source.');
    console.log('');

    // Optionally update the manifest with fresh timestamps (but keep hashes)
    if (oldManifest) {
      console.log('💡 Tip: Run with --update to refresh timestamps without changing hashes.');
    }
    return { changes: [], newManifest };
  }

  console.log(`⚠️  ${changes.length} change(s) detected:`);
  console.log('');

  for (const change of changes) {
    console.log(`📄 ${change.file} (${change.description})`);
    console.log(`   Type: ${change.type.replace(/_/g, ' ')}`);
    if (change.oldHash) {
      console.log(`   Old hash: ${change.oldHash}`);
      console.log(`   New hash: ${change.newHash}`);
    }
    if (change.oldSize && change.newSize) {
      console.log(`   Size: ${change.oldSize} → ${change.newSize} bytes (${change.newSize - change.oldSize})`);
    } else if (change.newSize) {
      console.log(`   Size: ${change.newSize} bytes`);
    }
    console.log('');
  }

  // Check page Last Updated date change
  if (oldManifest && oldManifest.pageLastUpdated && pageLastUpdated) {
    if (oldManifest.pageLastUpdated !== pageLastUpdated) {
      console.log('📅 Page "Last Updated" date changed:');
      console.log(`   Old: ${oldManifest.pageLastUpdated}`);
      console.log(`   New: ${pageLastUpdated}`);
      console.log('');
    }
  }

  console.log('=====================================');
  console.log('📝 RECOMMENDED ACTIONS');
  console.log('=====================================');
  console.log('1. Download the changed PDF(s) from the URLs above');
  console.log('2. Identify which procedures/content have changed');
  console.log('3. Compare against existing chapters in this study guide');
  console.log('4. Update affected chapters with review notes');
  console.log('5. Update source-manifest.json with new hashes');
  console.log('');

  return { changes, newManifest };
}

/**
 * Write manifest to file
 */
function writeManifest(manifest) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`💾 Manifest written to: ${MANIFEST_PATH}`);
}

// Run the check
const { changes, newManifest } = await checkForUpdates();

// Write the manifest (always, to establish or update baseline)
writeManifest(newManifest);

// Exit with appropriate code
process.exit(changes.length > 0 ? 1 : 0);
