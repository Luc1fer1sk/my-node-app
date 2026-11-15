const os = require('os');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'monitor.log');

function formatTimestamp(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${min}:${sec}`;
}

function getSystemSnapshot() {
  const cpus = os.cpus();
  return {
    timestamp: formatTimestamp(new Date()),
    group: '477',
    student: 'Ovchinnikov Denis Vladimirovich',
    platform: os.platform(),
    release: os.release(),
    totalMemGb: (os.totalmem() / (1024 ** 3)).toFixed(2),
    freeMemGb: (os.freemem() / (1024 ** 3)).toFixed(2),
    cpuModel: cpus.length ? cpus[0].model.trim() : 'N/A',
    cpuCores: cpus.length
  };
}

function getCpuTimes() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  cpus.forEach((cpu) => {
    const times = cpu.times;
    idle += times.idle;
    total += times.user + times.nice + times.sys + times.idle + times.irq;
  });
  return { idle, total };
}

function calculateCpuUsage(prev, curr) {
  const idleDiff = curr.idle - prev.idle;
  const totalDiff = curr.total - prev.total;
  if (totalDiff === 0) return 0;
  const busyDiff = totalDiff - idleDiff;
  return Math.min(100, Math.max(0, (busyDiff / totalDiff) * 100));
}

function logAnomaly(message) {
  const line = `[${formatTimestamp(new Date())}] [477] Preduprezhdenie: ${message}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

function startMonitoring(options = {}) {
  const intervalMs = options.intervalMs || 2000;
  const maxTicks = options.maxTicks || Infinity;
  let warningCount = 0;
  let tickCount = 0;

  console.log('=== Pervichnyi sbor dannyh sistemy ===');
  const snapshot = getSystemSnapshot();
  console.log(JSON.stringify(snapshot, null, 2));
  console.log('');
  console.log('Monitoring sistemy v realnom vremeni (gruppa 477). Dlya vyhoda nazhmite Ctrl+C.');

  let prevTimes = getCpuTimes();

  function stop() {
    console.log('');
    console.log(`Monitoring ostanovlen. Preduprezhdeniy: ${warningCount}`);
  }

  process.on('SIGINT', () => {
    stop();
    process.exit(0);
  });

  const timer = setInterval(() => {
    const currTimes = getCpuTimes();
    const cpuPercent = calculateCpuUsage(prevTimes, currTimes);
    prevTimes = currTimes;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);
    const freeGb = (freeMem / (1024 ** 3)).toFixed(2);
    const freePercent = ((freeMem / totalMem) * 100).toFixed(1);

    let warningMarker = '';
    let hasAnomaly = false;

    if (cpuPercent > 80) {
      warningMarker = ' ⚠⚠ (Kriticheskaya nagruzka CPU)';
      warningCount++;
      hasAnomaly = true;
      logAnomaly(`Vysokaya nagruzka processora: ${cpuPercent.toFixed(1)}%`);
    } else if (cpuPercent > 50) {
      warningMarker = ' ⚠ (Povyshennaya nagruzka CPU)';
      warningCount++;
      hasAnomaly = true;
      logAnomaly(`Povyshennaya nagruzka processora: ${cpuPercent.toFixed(1)}%`);
    }

    if (parseFloat(freePercent) < 10) {
      warningMarker += ' ⚠ (Malo RAM < 10%)';
      warningCount++;
      hasAnomaly = true;
      logAnomaly(`Malo svobodnoy pamyati: ${freePercent}% (${freeGb} GB)`);
    }

    const outputLine = `CPU: ${cpuPercent.toFixed(1)}% | RAM: ${ramPercent}% (${freeGb} GB svobodno)${warningMarker}`;
    if (process.stdout.isTTY) {
      process.stdout.write(`\r${outputLine.padEnd(80)}`);
    } else {
      console.log(outputLine);
    }

    tickCount++;
    if (tickCount >= maxTicks) {
      clearInterval(timer);
      stop();
    }
  }, intervalMs);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let maxTicks = Infinity;
  let intervalMs = 2000;

  const ticksIdx = args.indexOf('--ticks');
  if (ticksIdx !== -1 && args[ticksIdx + 1]) {
    maxTicks = parseInt(args[ticksIdx + 1], 10);
  }

  const intervalIdx = args.indexOf('--interval');
  if (intervalIdx !== -1 && args[intervalIdx + 1]) {
    intervalMs = parseInt(args[intervalIdx + 1], 10);
  }

  startMonitoring({ maxTicks, intervalMs });
}

module.exports = {
  getSystemSnapshot,
  getCpuTimes,
  calculateCpuUsage,
  logAnomaly,
  startMonitoring
};
