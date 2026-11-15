const os = require('os');

function formatUptime(seconds) {
  const sec = Math.floor(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSeconds = sec % 60;
  return `${hours} ch ${minutes} min ${remainingSeconds} sek`;
}

function getPlatformDescription(platform) {
  if (platform === 'win32') {
    return 'Vy rabotaete v Windows';
  }
  if (platform === 'linux') {
    return 'Vy rabotaete v Linux';
  }
  if (platform === 'darwin') {
    return 'Vy rabotaete v macOS';
  }
  return 'Neizvestnaya platforma';
}

function showSystemInfo() {
  const platform = os.platform();
  const type = os.type();
  const arch = os.arch();
  const release = os.release();
  const hostname = os.hostname();
  const uptime = formatUptime(os.uptime());

  console.log('=== Informaciya o sisteme (gruppa 477) ===');
  console.log(`Student:       Ovchinnikov Denis Vladimirovich`);
  console.log(`Platforma:     ${platform}`);
  console.log(`Tip OS:        ${type}`);
  console.log(`Arhitektura:   ${arch}`);
  console.log(`Versiya OS:    ${release}`);
  console.log(`Imya hosta:    ${hostname}`);
  console.log(`Vremya raboty: ${uptime}`);
  console.log('');
  console.log(getPlatformDescription(platform));
}

if (require.main === module) {
  showSystemInfo();
}

module.exports = {
  formatUptime,
  getPlatformDescription,
  showSystemInfo
};
