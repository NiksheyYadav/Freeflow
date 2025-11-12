#!/usr/bin/env node

/**
 * Test script to detect 404 errors in the application
 * 
 * This script:
 * 1. Checks that all referenced static assets exist
 * 2. Verifies the build output has correct paths
 * 3. Tests both development and production modes
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

// Track test results
let hasErrors = false;
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

/**
 * Test 1: Verify public directory structure
 */
function testPublicAssets() {
  info('\n=== Testing Public Assets ===');
  
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicDir)) {
    error('Public directory does not exist');
    results.failed++;
    hasErrors = true;
    return;
  }
  
  success('Public directory exists');
  results.passed++;
  
  // Check for vite.svg (referenced in index.html)
  const viteSvg = path.join(publicDir, 'vite.svg');
  if (fs.existsSync(viteSvg)) {
    success('vite.svg exists in public directory');
    results.passed++;
  } else {
    error('vite.svg is missing from public directory (referenced in index.html)');
    results.failed++;
    hasErrors = true;
  }
}

/**
 * Test 2: Verify index.html references
 */
function testIndexHtml() {
  info('\n=== Testing index.html References ===');
  
  const indexPath = path.join(process.cwd(), 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    error('index.html does not exist');
    results.failed++;
    hasErrors = true;
    return;
  }
  
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  // Check for absolute references (these need to exist in public/)
  const assetRegex = /(?:href|src)=["']([^"']+)["']/g;
  const matches = [];
  let match;
  
  while ((match = assetRegex.exec(indexContent)) !== null) {
    matches.push(match[1]);
  }
  
  success(`Found ${matches.length} asset references in index.html`);
  
  matches.forEach(assetPath => {
    // Skip external URLs and data URIs
    if (assetPath.startsWith('http') || assetPath.startsWith('data:') || assetPath.startsWith('//')) {
      info(`  Skipping external resource: ${assetPath}`);
      return;
    }
    
    // For local references starting with /, check if they exist in public/
    if (assetPath.startsWith('/')) {
      // Remove leading slash and base path if present
      const cleanPath = assetPath.replace(/^\/Freeflow\//, '').replace(/^\//, '');
      
      // Check in public directory
      const publicPath = path.join(process.cwd(), 'public', cleanPath);
      
      if (fs.existsSync(publicPath)) {
        success(`  ${assetPath} → exists at public/${cleanPath}`);
        results.passed++;
      } else if (cleanPath.startsWith('src/')) {
        // src/ files are handled by Vite in dev mode
        info(`  ${assetPath} → Vite will handle this in dev mode`);
      } else {
        error(`  ${assetPath} → NOT FOUND at public/${cleanPath}`);
        results.failed++;
        hasErrors = true;
      }
    }
  });
}

/**
 * Test 3: Verify vite.config.ts base path
 */
function testViteConfig() {
  info('\n=== Testing Vite Configuration ===');
  
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    warning('vite.config.ts does not exist');
    results.warnings++;
    return;
  }
  
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
  
  // Check for base path configuration
  if (viteConfig.includes("base:")) {
    const baseMatch = viteConfig.match(/base:\s*['"]([^'"]+)['"]/);
    if (baseMatch) {
      success(`Base path configured: ${baseMatch[1]}`);
      results.passed++;
      
      if (baseMatch[1] === '/Freeflow/') {
        success('Base path matches repository name (correct for GitHub Pages)');
        results.passed++;
      } else if (baseMatch[1] === '/') {
        warning('Base path is "/" - this works for custom domains but not GitHub Pages');
        results.warnings++;
      }
    }
  } else {
    warning('No base path configured in vite.config.ts');
    info('  For GitHub Pages, you should set: base: "/your-repo-name/"');
    results.warnings++;
  }
}

/**
 * Test 4: Check for common 404-prone patterns in code
 */
function testCodePatterns() {
  info('\n=== Testing Code for 404-Prone Patterns ===');
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    warning('src directory does not exist');
    results.warnings++;
    return;
  }
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.match(/\.(tsx?|jsx?|css)$/)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for hardcoded asset paths (potential 404 sources)
        const hardcodedPaths = content.match(/['"`]\/(?:assets|public|images|img)\/[^'"`]+['"`]/g);
        
        if (hardcodedPaths && hardcodedPaths.length > 0) {
          warning(`  Found hardcoded asset paths in ${path.relative(process.cwd(), filePath)}:`);
          hardcodedPaths.forEach(p => {
            warning(`    ${p}`);
          });
          results.warnings++;
        }
      }
    });
  }
  
  scanDirectory(srcDir);
  success('Code pattern scan complete');
  results.passed++;
}

/**
 * Test 5: Verify dist directory (if built)
 */
function testDistDirectory() {
  info('\n=== Testing Build Output ===');
  
  const distDir = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distDir)) {
    info('No dist directory found (run `npm run build` to create it)');
    return;
  }
  
  success('dist directory exists');
  results.passed++;
  
  // Check if vite.svg was copied to dist
  const distViteSvg = path.join(distDir, 'vite.svg');
  if (fs.existsSync(distViteSvg)) {
    success('vite.svg was copied to dist directory');
    results.passed++;
  } else {
    error('vite.svg is missing from dist directory');
    results.failed++;
    hasErrors = true;
  }
  
  // Check if index.html was generated
  const distIndex = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndex)) {
    success('index.html exists in dist directory');
    results.passed++;
    
    const distIndexContent = fs.readFileSync(distIndex, 'utf-8');
    
    // Check if paths have the correct base
    if (distIndexContent.includes('/Freeflow/')) {
      success('Build output uses correct base path (/Freeflow/)');
      results.passed++;
    } else {
      warning('Build output does not include /Freeflow/ base path');
      info('  This is okay for custom domains but required for GitHub Pages');
      results.warnings++;
    }
  } else {
    error('index.html is missing from dist directory');
    results.failed++;
    hasErrors = true;
  }
}

/**
 * Main test runner
 */
function runTests() {
  log('\n╔════════════════════════════════════════╗', colors.blue);
  log('║   404 Error Detection Test Suite      ║', colors.blue);
  log('╚════════════════════════════════════════╝', colors.blue);
  
  testPublicAssets();
  testIndexHtml();
  testViteConfig();
  testCodePatterns();
  testDistDirectory();
  
  // Print summary
  log('\n╔════════════════════════════════════════╗', colors.blue);
  log('║          Test Results Summary          ║', colors.blue);
  log('╚════════════════════════════════════════╝', colors.blue);
  
  success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    error(`Failed: ${results.failed}`);
  }
  if (results.warnings > 0) {
    warning(`Warnings: ${results.warnings}`);
  }
  
  if (hasErrors) {
    log('\n❌ Some tests failed. Please fix the issues above.', colors.red);
    process.exit(1);
  } else if (results.warnings > 0) {
    log('\n⚠️  All critical tests passed, but there are warnings to review.', colors.yellow);
    process.exit(0);
  } else {
    log('\n✅ All tests passed! No 404 errors detected.', colors.green);
    process.exit(0);
  }
}

// Run the tests
runTests();
