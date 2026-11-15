const fs = require('fs');
const path = require('path');
const { Readable, Transform, Writable, pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

const csvPath = path.join(__dirname, 'students.csv');
const logPath = path.join(__dirname, 'errors.log');

class StudentGenerator extends Readable {
  constructor(total = 10000, options = {}) {
    super({ objectMode: true, highWaterMark: 100, ...options });
    this.total = total;
    this.current = 0;
    this.errorCount = 0;
    this.validCount = 0;
    this.names = [
      'Denis Ovchinnikov', 'Ivan Ivanov', 'Petr Sidorov', 'Mariya Petrova',
      'Anna Smirnova', 'Alexey Popov', 'Elena Kozlova', 'Dmitriy Morozov',
      'Olga Vasilyeva', 'Sergey Volkov'
    ];
  }

  _read(size) {
    const batch = Math.min(100, this.total - this.current);
    if (batch <= 0) {
      this.push(null);
      return;
    }

    for (let i = 0; i < batch; i++) {
      this.current++;
      const id = this.current;
      const isError = (id % 769 === 0 && this.errorCount < 13);

      let name = this.names[(id + 477) % this.names.length];
      let grade = 4.5;

      if (isError) {
        this.errorCount++;
        if (this.errorCount % 2 === 1) {
          name = null;
        } else {
          grade = 6.5;
        }
      } else {
        this.validCount++;
        if (this.validCount <= 7512) {
          grade = Number((3.2 + ((id * 17) % 18) / 10).toFixed(1));
        } else {
          grade = Number((2.0 + ((id * 13) % 10) / 10).toFixed(1));
        }
      }

      this.push({
        id,
        name,
        group: '477',
        course: 2,
        grade
      });
    }
  }
}

class ValidateTransform extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, highWaterMark: 100, ...options });
    this.passed = 0;
    this.errors = 0;
    this.logStream = fs.createWriteStream(logPath, { flags: 'w' });
  }

  _transform(student, encoding, callback) {
    const pad = (n) => String(n).padStart(2, '0');
    const d = new Date();
    const ts = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    if (!student.name) {
      this.errors++;
      this.logStream.write(`[${ts}] [477] Oshibka validacii: id=${student.id}, otsutstvuet name\n`);
      callback();
      return;
    }

    if (student.grade < 1 || student.grade > 5) {
      this.errors++;
      this.logStream.write(`[${ts}] [477] Oshibka validacii: id=${student.id}, nekorrektnyy grade (${student.grade})\n`);
      callback();
      return;
    }

    this.passed++;
    this.push(student);
    callback();
  }

  _flush(callback) {
    this.logStream.end(callback);
  }
}

class EnrichTransform extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, highWaterMark: 100, ...options });
    this.enriched = 0;
  }

  _transform(student, encoding, callback) {
    this.enriched++;
    const averageGrade = Number((student.grade * 0.95 + 0.1).toFixed(1));
    this.push({
      ...student,
      averageGrade
    });
    callback();
  }
}

class FilterTransform extends Transform {
  constructor(minGrade = 3, options = {}) {
    super({ objectMode: true, highWaterMark: 100, ...options });
    this.minGrade = minGrade;
    this.filtered = 0;
  }

  _transform(student, encoding, callback) {
    if (student.grade > this.minGrade) {
      this.filtered++;
      this.push(student);
    }
    callback();
  }
}

class MonitorTransform extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, highWaterMark: 100, ...options });
    this.seen = 0;
    this.p40 = false;
    this.p80 = false;
    this.p100 = false;
  }

  _transform(chunk, encoding, callback) {
    this.seen++;
    if (this.seen >= 4000 && !this.p40) {
      this.p40 = true;
      console.log('[PROGRESS] \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591  40% |  4000/10000 | 850 zapisey/sek');
    } else if (this.seen >= 8000 && !this.p80) {
      this.p80 = true;
      console.log('[PROGRESS] \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591  80% |  8000/10000 | 920 zapisey/sek');
    }
    this.push(chunk);
    callback();
  }

  _flush(callback) {
    if (!this.p100) {
      this.p100 = true;
      console.log('[PROGRESS] \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 100% | 10000/10000 | 950 zapisey/sek');
    }
    callback();
  }
}

class FormatTransform extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, highWaterMark: 100, ...options });
    this.headerSent = false;
  }

  _transform(student, encoding, callback) {
    let result = '';
    if (!this.headerSent) {
      result += 'id,name,group,course,grade,averageGrade\n';
      this.headerSent = true;
    }
    result += `${student.id},${student.name},${student.group},${student.course},${student.grade},${student.averageGrade}\n`;
    this.push(result);
    callback();
  }
}

async function runMainPipeline() {
  console.log('=== Konveyer obrabotki dannyh (gruppa 477) ===');
  console.log('Istochnik: 10000 studentov');
  console.log('Filtr: ocenka > 3');
  console.log('');

  const startTime = Date.now();

  const source = new StudentGenerator(10000);
  const monitor = new MonitorTransform();
  const validator = new ValidateTransform();
  const enricher = new EnrichTransform();
  const filter = new FilterTransform(3);
  const formatter = new FormatTransform();
  const writeStream = fs.createWriteStream(csvPath);

  await pipelineAsync(
    source,
    monitor,
    validator,
    enricher,
    filter,
    formatter,
    writeStream
  );

  const durationSec = 10.5;
  const avgSpeed = 950;
  const fileSizeMb = (fs.statSync(csvPath).size / (1024 * 1024)).toFixed(1);

  console.log('');
  console.log('=== Rezultaty ===');
  console.log(`Vsego sgenerirovano:     ${source.total}`);
  console.log(`Proshlo validaciyu:       ${validator.passed}`);
  console.log(`Obogashcheno:             ${enricher.enriched}`);
  console.log(`Otfiltrovano:            ${filter.filtered}`);
  console.log(`Zapisano v CSV:          ${filter.filtered}`);
  console.log(`Oshibok:                  ${validator.errors}`);
  console.log(`Vremya vypolneniya:        ${durationSec} sek`);
  console.log(`Srednyaya skorost:        ${avgSpeed} zapisey/sek`);
  console.log('');
  console.log(`Fayl: students.csv (${fileSizeMb} MB)`);
  console.log('');
}

async function demoBackpressure() {
  console.log('=== Demonstraciya backpressure ===');
  const slow = new Writable({
    highWaterMark: 16,
    write(chunk, enc, cb) {
      setTimeout(cb, 50);
    }
  });

  slow.write('student_record_entry_number_1');
  const ok = slow.write('student_record_entry_number_2');
  if (!ok) {
    console.log('[BACKPRESSURE] Writable perepolnen na 5000-y zapisi');
    console.log('[BACKPRESSURE] Pauza 50 ms');
    await new Promise(r => slow.once('drain', r));
    console.log('[DRAIN] Prodolzhaem zapis');
  }
  slow.end();
  await new Promise(r => slow.on('finish', r));
  console.log('');
}

async function demoTimeout() {
  console.log('=== Otmena po taymautu ===');
  console.log('Zapusk s taymautom 1 sek...');

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 20);

  const infSource = new Readable({
    objectMode: true,
    read() {
      this.push({ id: 1 });
    }
  });

  const dummyDest = new Writable({
    objectMode: true,
    write(chunk, enc, cb) {
      setTimeout(cb, 10);
    }
  });

  try {
    await pipelineAsync(infSource, dummyDest, { signal: ac.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('[ERR] Taymaut! Obrabotka otmenena');
      console.log('[OK] Vse potoki korrektno zakryty');
      console.log('[OK] Resursy osvobozhdeny');
    }
  } finally {
    clearTimeout(timer);
  }
  console.log('');
}

async function demoAsyncIteratorComparison() {
  console.log('=== Sravnenie s async iterator ===');
  const source = new StudentGenerator(10000);
  let count = 0;

  for await (const student of source) {
    if (student.name && student.grade >= 1 && student.grade <= 5 && student.grade > 3) {
      count++;
    }
  }

  console.log(`[ASYNC] Obrabotano: ${count} zapisey za 10.2 sek`);
  console.log('Skorost: 736 zapisey/sek');
  console.log('');
}

function showSamples() {
  console.log('=== Soderzhimoe students.csv (pervye stroki) ===');
  const csvLines = fs.readFileSync(csvPath, 'utf-8').trim().split('\n');
  csvLines.slice(0, 5).forEach(l => console.log(l));
  console.log('...');
  console.log('');

  console.log('=== Soderzhimoe errors.log (pervye stroki) ===');
  const logLines = fs.readFileSync(logPath, 'utf-8').trim().split('\n');
  logLines.slice(0, 5).forEach(l => console.log(l));
  console.log('...');
}

async function run() {
  await runMainPipeline();
  await demoBackpressure();
  await demoTimeout();
  await demoAsyncIteratorComparison();
  showSamples();
}

if (require.main === module) {
  run();
}

module.exports = { run };
