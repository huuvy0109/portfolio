const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../public/reports');
const REGISTRY_FILE = path.join(REPORTS_DIR, 'registry.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function run() {
  console.log('🚀 Running Playwright tests...');
  
  let success = true;
  try {
    // We run tests. We don't use --headed here as this is for archiving.
    execSync('npx playwright test', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Some tests failed, but archiving report anyway.');
    success = false;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runId = `run-${timestamp}`;
  const targetDir = path.join(REPORTS_DIR, runId);

  console.log(`📦 Archiving report to ${runId}...`);
  ensureDir(targetDir);

  const sourceDir = path.join(__dirname, '../playwright-report');
  
  if (!fs.existsSync(sourceDir)) {
    console.error('❌ Error: playwright-report directory not found!');
    process.exit(1);
  }

  // Copy report files
  copyRecursiveSync(sourceDir, targetDir);

  // Update registry
  let registry = [];
  if (fs.existsSync(REGISTRY_FILE)) {
    try {
      registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } catch (e) {
      registry = [];
    }
  }

  const newEntry = {
    id: runId,
    timestamp: new Date().toISOString(),
    status: success ? 'passed' : 'failed',
    reportPath: `/reports/${runId}/index.html`,
    jsonPath: `/reports/${runId}/results.json`
  };

  registry.unshift(newEntry);
  
  // Keep only last 10 runs
  registry = registry.slice(0, 10);

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
  console.log('✅ Done! Registry updated.');
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

run();
