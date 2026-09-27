const { existsSync } = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const cli = path.join(projectRoot, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const launcher = path.join(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'ng.cmd' : 'ng');

if (!existsSync(cli) || !existsSync(launcher)) {
  console.error('\nAngular CLI ของโปรเจกต์ยังไม่ได้ติดตั้ง หรือ node_modules ไม่ครบ');
  console.error('จากโฟลเดอร์ frontend/erp-web ให้รัน:\n');
  console.error('  npm ci --include=dev');
  console.error('  npm start\n');
  console.error('บน PowerShell ใช้ npm.cmd แทน npm ได้');
  console.error('node_modules ไม่ถูกเก็บใน Git ต้องติดตั้งในแต่ละ clone/worktree\n');
  process.exitCode = 1;
}
