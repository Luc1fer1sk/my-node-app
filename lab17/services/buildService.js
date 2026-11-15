const fs = require('fs');
const path = require('path');
const { readConfig } = require('./configService');

function buildProject(options = {}) {
  if (options.requireConfig) {
    readConfig(options.config);
  }

  const distDir = path.resolve(process.cwd(), 'dist');
  const outFile = path.join(distDir, 'my-app.js');

  if (options.dryRun) {
    return {
      dryRun: true,
      output: outFile
    };
  }

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  fs.writeFileSync(outFile, 'console.log("Build gotov dlya gruppy 477");\n', 'utf-8');

  return {
    dryRun: false,
    output: 'dist/my-app.js'
  };
}

module.exports = {
  buildProject
};
