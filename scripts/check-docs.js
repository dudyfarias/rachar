const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const requiredFiles = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'PROJECT_RULES.md',
  '.env.example',
  'docs/sprint-1.md',
  'docs/sprint-2.md',
  'docs/sprint-3.md',
  'docs/sprint-4.md',
  'docs/sprint-5.md',
  'docs/sprint-6.md',
  'docs/sprint-7.md',
  'docs/sprint-8.md',
  'docs/sprint-9.md',
  'docs/sprint-10.md',
  'docs/sprint-11.md',
  'docs/architecture.md',
  'docs/database.md',
  'docs/api.md',
  'docs/design-system.md',
  'docs/qa-frontend.md',
  'docs/pwa-vercel.md',
  'docs/roadmap.md',
  'docs/changelog.md',
  '.github/pull_request_template.md',
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/feature_request.md',
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missingFiles.length > 0) {
  console.error('Missing required project documents:');
  missingFiles.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log('Documentation baseline is complete.');
