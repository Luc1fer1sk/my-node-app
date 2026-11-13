const fs = require('fs');
const path = require('path');

function readConfig(configPath) {
  const target = configPath ? path.resolve(configPath) : path.resolve(process.cwd(), 'config.json');
  if (!fs.existsSync(target)) {
    const err = new Error(`fayl konfiguracii ne nayden\nUkazhite put cherez --config\nPodrobnosti: ${path.basename(target)} otsutstvuet`);
    err.code = 'ENOENT';
    throw err;
  }
  const content = fs.readFileSync(target, 'utf-8');
  return JSON.parse(content);
}

module.exports = {
  readConfig
};
