const fs = require('fs');
const path = require('path');
const { pipeline, Transform } = require('stream');

const inputPath = path.join(__dirname, 'input.txt');
const pipeOutPath = path.join(__dirname, 'output-pipe.txt');
const pipelineOutPath = path.join(__dirname, 'output-pipeline.txt');
const chainOutPath = path.join(__dirname, 'output-chain.txt');
const missingPath = path.join(__dirname, 'missing.txt');

const initialContent = [
  'Laboratornaya rabota No 21 po Node.js.',
  'Student: Ovchinnikov Denis Vladimirovich.',
  'Gruppa: 477.',
  'Potoki dannyh pozvolyayut obrabatyvat bolshie obyomy informacii effektivno.'
].join('\n');

function ensureInput() {
  if (!fs.existsSync(inputPath)) {
    fs.writeFileSync(inputPath, initialContent, 'utf-8');
  }
}

function demoPipe(callback) {
  console.log('=== Demonstraciya pipe() ===');
  console.log('Chtenie: input.txt');
  console.log('Zapis: output-pipe.txt');

  const src = fs.createReadStream(inputPath);
  const dest = fs.createWriteStream(pipeOutPath);

  src.pipe(dest);

  dest.on('finish', () => {
    const stats = fs.statSync(pipeOutPath);
    console.log('[OK] Kopirovanie zaversheno');
    console.log(`Razmer: ${stats.size} bayt`);
    console.log('');
    callback();
  });

  src.on('error', (err) => {
    console.error(`[ERR] Oshibka: ${err.message}`);
    callback();
  });
}

function demoPipeError(callback) {
  console.log('=== Demonstraciya pipe() s oshibkoy ===');
  console.log('Chtenie: missing.txt');

  const src = fs.createReadStream(missingPath);
  const dest = fs.createWriteStream(path.join(__dirname, 'output-pipe-leak.txt'));

  src.pipe(dest);

  src.on('error', (err) => {
    console.log(`[ERR] Oshibka: ${err.code}: no such file or directory`);
    if (!dest.destroyed) {
      console.log('[WARN] Vnimanie: pipe() ne zakryl celevoy potok!');
      console.log('[WARN] Vozmozhna utechka pamyati.');
      dest.destroy();
    }
    console.log('');
    callback();
  });
}

function demoPipeline(callback) {
  console.log('=== Demonstraciya pipeline() ===');
  console.log('Chtenie: input.txt');
  console.log('Zapis: output-pipeline.txt');

  const src = fs.createReadStream(inputPath);
  const dest = fs.createWriteStream(pipelineOutPath);

  pipeline(src, dest, (err) => {
    if (err) {
      console.error(`[ERR] Oshibka pipeline: ${err.message}`);
    } else {
      console.log('[OK] Kopirovanie zaversheno');
    }
    console.log('');
    callback();
  });
}

function demoPipelineError(callback) {
  console.log('=== Demonstraciya pipeline() s oshibkoy ===');
  console.log('Chtenie: missing.txt');

  const src = fs.createReadStream(missingPath);
  const dest = fs.createWriteStream(path.join(__dirname, 'output-pipeline-leak.txt'));

  pipeline(src, dest, (err) => {
    if (err) {
      console.log(`[ERR] Oshibka: ${err.code}: no such file or directory`);
      if (dest.destroyed) {
        console.log('[OK] Vse potoki avtomaticheski zakryty');
        console.log('[OK] Utechek net');
      }
    }
    console.log('');
    callback();
  });
}

function demoChain(callback) {
  console.log('=== Cepochka potokov ===');
  console.log('input.txt -> uppercase -> reverse -> output-chain.txt');

  const uppercaseTransform = new Transform({
    transform(chunk, encoding, cb) {
      cb(null, chunk.toString().toUpperCase());
    }
  });

  const reverseTransform = new Transform({
    transform(chunk, encoding, cb) {
      const reversed = chunk.toString().split('\n').map(line => line.split('').reverse().join('')).join('\n');
      cb(null, reversed);
    }
  });

  const src = fs.createReadStream(inputPath);
  const dest = fs.createWriteStream(chainOutPath);

  pipeline(src, uppercaseTransform, reverseTransform, dest, (err) => {
    if (err) {
      console.error(`[ERR] Oshibka tsepochki: ${err.message}`);
    } else {
      console.log('[OK] Obrabotka zavershena');
    }
    console.log('');
    callback();
  });
}

function showFiles() {
  console.log('=== Soderzhimoe vyhodnyh faylov ===');
  console.log('--- output-pipe.txt ---');
  console.log(fs.readFileSync(pipeOutPath, 'utf-8'));
  console.log('--- output-pipeline.txt ---');
  console.log(fs.readFileSync(pipelineOutPath, 'utf-8'));
  console.log('--- output-chain.txt ---');
  console.log(fs.readFileSync(chainOutPath, 'utf-8'));
}

function run() {
  ensureInput();
  demoPipe(() => {
    demoPipeError(() => {
      demoPipeline(() => {
        demoPipelineError(() => {
          demoChain(() => {
            showFiles();
          });
        });
      });
    });
  });
}

if (require.main === module) {
  run();
}

module.exports = { run };
