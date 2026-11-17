const { Transform, Readable, Writable } = require('stream');

class UpperCaseTransform extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const upper = chunk.toString().trim().toUpperCase();
    const result = `[477] ${upper}`;
    this.push(result);
    callback();
  }
}

class JsonParserTransform extends Transform {
  constructor(options) {
    super({ objectMode: true, ...options });
  }

  _transform(chunk, encoding, callback) {
    try {
      const obj = JSON.parse(chunk.toString());
      this.push(obj);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}

class FilterTransform extends Transform {
  constructor(targetGroup, options) {
    super({ objectMode: true, ...options });
    this.targetGroup = targetGroup;
  }

  _transform(chunk, encoding, callback) {
    if (chunk && chunk.group === this.targetGroup) {
      this.push(chunk);
    }
    callback();
  }
}

async function demoUpperCase() {
  console.log('=== Demonstraciya Transform-potoka ===');
  const upper = new UpperCaseTransform();
  
  const testInputs = ['gruppa 477', 'student ovchinnikov'];
  for (const input of testInputs) {
    console.log(`Vhod:  "${input}"`);
    upper.write(input);
    const output = upper.read();
    if (output) {
      console.log(`Vyhod: "${output.toString()}"`);
    }
  }
  console.log('');
}

async function demoObjectMode() {
  console.log('=== Demonstraciya Object Mode ===');
  const students = [
    { id: 1, name: 'Denis', group: '477' },
    { id: 2, name: 'Mariya', group: '478' },
    { id: 3, name: 'Petr', group: '477' }
  ];

  students.forEach(s => {
    console.log(`[OBJECT] { id: ${s.id}, name: '${s.name}', group: '${s.group}' }`);
  });

  console.log('');
  console.log('Posle filtracii (tolko 477):');
  const filter = new FilterTransform('477');
  
  filter.on('data', (s) => {
    console.log(`[OBJECT] { id: ${s.id}, name: '${s.name}', group: '${s.group}' }`);
  });

  students.forEach(s => filter.write(s));
  filter.end();

  await new Promise(resolve => filter.on('finish', resolve));
  console.log('');
}

async function demoAsyncIterator() {
  console.log('=== Demonstraciya async iterator ===');
  const readable = Readable.from(['Dannye 1', 'Dannye 2', 'Dannye 3']);

  let count = 0;
  for await (const chunk of readable) {
    count++;
    console.log(`[ASYNC] Poluchen chank ${count}: "${chunk}"`);
  }
  console.log('[ASYNC] Potok zavershyon');
  console.log('');
}

async function demoChain() {
  console.log('=== Cepochka Transform ===');
  console.log('Chitaem -> UpperCase -> Filter -> Zapisyvaem');

  const lines = [
    'gruppa 477 - student 1',
    'gruppa 478 - student 2',
    'gruppa 477 - student 3',
    'gruppa 479 - student 4',
    'gruppa 477 - student 5',
    'gruppa 477 - student 6',
    'gruppa 478 - student 7',
    'gruppa 477 - student 8',
    'gruppa 477 - student 9',
    'gruppa 477 - student 10'
  ];

  const source = Readable.from(lines);
  const upper = new Transform({
    transform(chunk, encoding, cb) {
      cb(null, chunk.toString().toUpperCase());
    }
  });

  const filter = new Transform({
    transform(chunk, encoding, cb) {
      const str = chunk.toString();
      if (str.includes('477')) {
        cb(null, str + '\n');
      } else {
        cb();
      }
    }
  });

  let processedCount = lines.length;
  let filteredCount = 0;

  const dest = new Writable({
    write(chunk, encoding, cb) {
      filteredCount++;
      cb();
    }
  });

  source.pipe(upper).pipe(filter).pipe(dest);

  await new Promise(resolve => dest.on('finish', resolve));
  console.log(`[OK] Obrabotano ${processedCount} strok, otfiltrovano ${filteredCount}`);
}

async function run() {
  await demoUpperCase();
  await demoObjectMode();
  await demoAsyncIterator();
  await demoChain();
}

if (require.main === module) {
  run();
}

module.exports = {
  UpperCaseTransform,
  JsonParserTransform,
  FilterTransform,
  run
};
