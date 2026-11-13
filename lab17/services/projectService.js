const fs = require('fs');
const path = require('path');

function initProject(options) {
  const name = options.name || 'my-app';
  const type = options.type || 'cli';
  const targetDir = path.resolve(process.cwd(), name);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const pkg = {
    name,
    version: '1.0.0',
    type: 'commonjs',
    projectType: type,
    studentGroup: '477'
  };

  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf-8');

  return {
    name,
    type,
    path: targetDir
  };
}

module.exports = {
  initProject
};
