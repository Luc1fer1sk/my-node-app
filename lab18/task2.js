const os = require('os');

function showCpuAndMemoryInfo() {
  const cpus = os.cpus();
  const coreCount = cpus.length;
  const cpuModel = cpus.length > 0 ? cpus[0].model.trim() : 'Neizvestno';
  const totalSpeed = cpus.reduce((acc, c) => acc + c.speed, 0);
  const avgSpeed = (totalSpeed / coreCount).toFixed(0);

  console.log('=== Informaciya o processore ===');
  console.log(`Kolichestvo logicheskih yader: ${coreCount}`);
  console.log(`Model processora:              ${cpuModel}`);
  console.log(`Srednyaya chastota:            ${avgSpeed} MHz`);
  console.log('Chastota po yadram:');
  cpus.forEach((c, idx) => {
    if (idx < 8) {
      console.log(`  Yadro ${idx + 1}: ${c.speed} MHz`);
    }
  });
  if (coreCount > 8) {
    console.log(`  ... i eshche ${coreCount - 8} yader`);
  }

  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;

  const totalMemGb = (totalMemBytes / (1024 ** 3)).toFixed(2);
  const freeMemGb = (freeMemBytes / (1024 ** 3)).toFixed(2);
  const usedMemGb = (usedMemBytes / (1024 ** 3)).toFixed(2);

  const usedPercent = ((usedMemBytes / totalMemBytes) * 100).toFixed(1);
  const freePercent = ((freeMemBytes / totalMemBytes) * 100).toFixed(1);

  console.log('');
  console.log('=== Informaciya o pamyati ===');
  console.log(`Obshchiy obem:   ${totalMemGb} GB`);
  console.log(`Svobodno:        ${freeMemGb} GB (${freePercent}%)`);
  console.log(`Ispolzovano:     ${usedMemGb} GB (${usedPercent}%)`);

  const load = os.loadavg();
  console.log('');
  console.log('=== Srednyaya zagruzka sistemy (loadavg) ===');
  if (os.platform() === 'win32') {
    console.log(`1 min: ${load[0]}, 5 min: ${load[1]}, 15 min: ${load[2]} (nedostupno dlya Windows, vsegda 0)`);
  } else {
    console.log(`1 min: ${load[0].toFixed(2)}, 5 min: ${load[1].toFixed(2)}, 15 min: ${load[2].toFixed(2)}`);
  }

  console.log('');
  console.log('Gruppa: 477');
  if (parseFloat(freePercent) < 20) {
    console.log('Preduprezhdenie: malo svobodnoy pamyati (< 20%)!');
  } else {
    console.log('Pamyat v norme');
  }
}

if (require.main === module) {
  showCpuAndMemoryInfo();
}

module.exports = {
  showCpuAndMemoryInfo
};
