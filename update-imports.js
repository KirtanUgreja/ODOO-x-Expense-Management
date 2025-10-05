const fs = require('fs');
const path = require('path');

const files = [
  'components/admin-dashboard.tsx',
  'components/approval-rule-config.tsx',
  'components/auth-page.tsx',
  'components/employee-dashboard.tsx',
  'components/expense-submission-form.tsx',
  'components/manager-dashboard.tsx',
  'components/user-management.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    'from "@/lib/data-context"',
    'from "@/lib/data-context-supabase"'
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${file}`);
});

console.log('All imports updated!');