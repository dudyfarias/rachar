const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const sourceDirs = ['src/components', 'src/features'];
const forbiddenPatterns = [
  { label: 'copy interna de sprint', pattern: /\bSprint\s+\d+\b/i },
  { label: 'mojibake UTF-8', pattern: /Ã|Â|â€|â†|âœ/ },
  { label: 'copy tecnica de RLS', pattern: /\bRLS\b/ },
  { label: 'copy de planejamento interno', pattern: /proximos sprints/i },
];

const requiredTestIds = [
  'screen-onboarding',
  'onboarding-active-step',
  'onboarding-next-step-button',
  'onboarding-scan-start-button',
  'onboarding-auth-login-link',
  'onboarding-auth-register-link',
  'screen-login',
  'login-email-input',
  'login-password-input',
  'login-submit-button',
  'login-demo-button',
  'screen-home',
  'home-new-bill-button',
  'home-receipt-capture-button',
  'home-social-button',
  'home-history-button',
  'screen-new-bill',
  'new-bill-title-input',
  'new-bill-continue-button',
  'screen-add-people',
  'add-people-name-input',
  'add-people-add-button',
  'add-people-continue-button',
  'screen-add-items',
  'add-items-name-input',
  'add-items-price-input',
  'add-items-add-button',
  'add-items-continue-button',
  'screen-result',
  'result-share-summary-button',
  'result-finish-button',
  'screen-receipt-capture',
  'receipt-capture-camera-button',
  'receipt-capture-gallery-button',
  'receipt-capture-process-button',
  'screen-social',
  'social-pix-key-input',
  'social-save-pix-button',
  'social-group-name-input',
  'social-save-group-button',
  'screen-bill-history',
  'bill-history-list',
  'screen-shared-bill',
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [fullPath] : [];
  });
}

const sourceFiles = sourceDirs.flatMap((dir) => walk(path.join(root, dir)));
const failures = [];
const allSource = sourceFiles
  .map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file);

    for (const { label, pattern } of forbiddenPatterns) {
      const match = content.match(pattern);
      if (match) {
        failures.push(`${relative}: encontrou ${label} (${match[0]})`);
      }
    }

    return content;
  })
  .join('\n');

for (const testId of requiredTestIds) {
  if (!allSource.includes(`testID="${testId}"`)) {
    failures.push(`testID obrigatorio ausente: ${testId}`);
  }
}

if (failures.length > 0) {
  console.error('UI contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('UI contract baseline is complete.');
