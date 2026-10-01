const fs = require('fs');
const path = require('path');
const util = require('util');

const TEST_DIR = './perf-test-data';
const FILE_COUNT = 100;
const CONTENT = 'x'.repeat(1024);

const fsWriteFile = util.promisify(fs.writeFile);
const fsReadFile = util.promisify(fs.readFile);
const fsUnlink = util.promisify(fs.unlink);

function measureTime(label, fn) {
    return new Promise((resolve) => {
        const start = process.hrtime.bigint();
        
        fn(() => {
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1_000_000;
            console.log(`${label}: ${durationMs.toFixed(2)} мс`);
            resolve(durationMs);
        });
    });
}

function setup() {
    if (fs.existsSync(TEST_DIR)) {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

function testSync(done) {
    for (let i = 0; i < FILE_COUNT; i++) {
        const fp = path.join(TEST_DIR, `sync-${i}.txt`);
        fs.writeFileSync(fp, CONTENT, 'utf8');
        fs.readFileSync(fp, 'utf8');
        fs.unlinkSync(fp);
    }
    done();
}

function testCallbacks(done) {
    let completed = 0;
    
    for (let i = 0; i < FILE_COUNT; i++) {
        const fp = path.join(TEST_DIR, `cb-${i}.txt`);
        
        fs.writeFile(fp, CONTENT, 'utf8', (err) => {
            if (err) throw err;
            
            fs.readFile(fp, 'utf8', (err) => {
                if (err) throw err;
                
                fs.unlink(fp, (err) => {
                    if (err) throw err;
                    completed++;
                    if (completed === FILE_COUNT) done();
                });
            });
        });
    }
}

async function testPromises(done) {
    const tasks = [];
    
    for (let i = 0; i < FILE_COUNT; i++) {
        const fp = path.join(TEST_DIR, `prom-${i}.txt`);
        
        tasks.push(
            fsWriteFile(fp, CONTENT, 'utf8')
                .then(() => fsReadFile(fp, 'utf8'))
                .then(() => fsUnlink(fp))
        );
    }
    
    await Promise.all(tasks);
    done();
}

async function runBenchmarks() {
    console.log(`Бенчмарк: ${FILE_COUNT} файлов (запись + чтение + удаление)\n`);
    
    setup();
    const tSync = await measureTime('Sync      ', testSync);
    
    setup();
    const tCb = await measureTime('Callbacks ', testCallbacks);
    
    setup();
    const tProm = await measureTime('Promises  ', testPromises);
    
    console.log('\nРЕЗУЛЬТАТЫ:');
    console.log('─'.repeat(40));
    console.log(`Sync:      ${tSync.toFixed(2)} мс`);
    console.log(`Callbacks: ${tCb.toFixed(2)} мс (${(tSync/tCb).toFixed(2)}x быстрее sync)`);
    console.log(`Promises:  ${tProm.toFixed(2)} мс (${(tSync/tProm).toFixed(2)}x быстрее sync)`);
    console.log('─'.repeat(40));
    
    if (fs.existsSync(TEST_DIR)) {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

runBenchmarks().catch(console.error);
