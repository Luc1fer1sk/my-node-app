const { Writable } = require('stream');

class CustomWritable extends Writable {
  constructor(options) {
    super({ highWaterMark: 52, ...options });
    this.totalWritten = 0;
  }

  _write(chunk, encoding, callback) {
    setTimeout(() => {
      this.totalWritten++;
      callback();
    }, 50);
  }
}

function run() {
  console.log('=== Demonstraciya Writable-potoka ===');
  console.log('');

  const writable = new CustomWritable();

  const data = [
    'Gruppa: 477',
    'Student: Ovchinnikov Denis Vladimirovich',
    'Laboratornaya rabota: No 21',
    'Tema: Potoki v Node.js'
  ];

  let index = 0;

  function writeNext() {
    let canWrite = true;

    while (index < data.length && canWrite) {
      const item = data[index];
      index++;

      canWrite = writable.write(item);

      if (canWrite) {
        console.log(`[WRITE] ${item}  write() vernul: true`);
      } else {
        console.log(`[WRITE] ${item}  write() vernul: false  <-- bufer perepolnen!`);
      }

      if (!canWrite && index < data.length) {
        writable.once('drain', () => {
          console.log('[DRAIN] Bufer osvobozhdyon, prodolzhaem zapis');
          writeNext();
        });
        return;
      }
    }

    if (index >= data.length) {
      writable.end();
    }
  }

  writable.on('finish', () => {
    console.log('');
    console.log('[FINISH] Vse dannye zapisany');
    console.log(`Vsego zapisano: ${writable.totalWritten} chanka`);
  });

  writable.on('error', (err) => {
    console.error(`[ERROR] Oshibka zapisi: ${err.message}`);
  });

  writeNext();
}

if (require.main === module) {
  run();
}

module.exports = { CustomWritable, run };
