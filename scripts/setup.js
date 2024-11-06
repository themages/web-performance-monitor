const { execSync } = require('child_process');
const { chmod } = require('fs');

console.log('开始设置项目...');

try {
  // 设置脚本执行权限
  chmod('scripts/*.sh', 0o755, (err) => {
    if (err) throw err;
  });

  // 执行设置脚本
  execSync('./scripts/setup.sh', { stdio: 'inherit' });
} catch (error) {
  console.error('设置失败:', error);
  process.exit(1);
} 