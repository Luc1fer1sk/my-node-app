const { Readable } = require('stream');

class StudentReadable extends Readable {
  constructor(options) {
    super(options);
    this.chunks = [
      'Gruppa: 477',
      'Student: Ovchinnikov Denis Vladimirovich',
      'Laboratornaya rabota: No 21',
      'Tema: Potoki v Node.js'
    ];
    this.index = 0;
  }

  _read() {
    if (this.index < this.chunks.length) {
      const chunk = this.chunks[this.index];
      this.index++;
      this.push(chunk);
    } else {
      this.push(null);
    }
  }
}

function run() {
  console.log('=== Demonstraciya Readable-potoka ===');
  console.log('');

  const stream = new StudentReadable();
  let count = 0;
  let totalBytes = 0;

  stream.on('data', (chunk) => {
    count++;
    const str = chunk.toString();
    totalBytes += Buffer.byteLength(chunk);
    console.log(`[CHUNK ${count}] ${str}`);
  });

  stream.on('end', () => {
    console.log('');
    console.log('[END] Potok zavershyon');
    console.log(`Vsego polucheno chankov: ${count}`);
    console.log(`Obshchiy razmer dannyh: ${totalBytes} bayt`);
  });

  stream.on('error', (err) => {
    console.error(`[ERROR] Oshibka potoka: ${err.message}`);
  });
}

if (require.main === module) {
  run();
}

module.exports = { StudentReadable, run };
