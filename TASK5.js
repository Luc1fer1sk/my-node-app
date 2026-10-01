const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- НАСТРОЙКИ ---
const VARIANT = 1; // Измените на ваш номер варианта
const SOURCE_DIR = `source_${VARIANT}`;
const BACKUP_DIR = `backup_${VARIANT}`;
const REPORT_FILE = `sync_report_${VARIANT}.txt`;

// 1. Создание тестовой структуры
function createTestStructure() {
    console.log(`Создание структуры в ${SOURCE_DIR}...`);
    
    // Очистка если есть
    if (fs.existsSync(SOURCE_DIR)) fs.rmSync(SOURCE_DIR, { recursive: true, force: true });
    if (fs.existsSync(BACKUP_DIR)) fs.rmSync(BACKUP_DIR, { recursive: true, force: true });

    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    
    // Создаем подпапки
    const subdirs = ['docs', 'images', 'scripts'];
    subdirs.forEach(dir => fs.mkdirSync(path.join(SOURCE_DIR, dir), { recursive: true }));

    const filesToCreate = [];
    
    // Текстовые файлы (.txt, .js, .json)
    for (let i = 1; i <= 12; i++) {
        const ext = i % 3 === 0 ? '.json' : (i % 2 === 0 ? '.js' : '.txt');
        const content = `Content of file ${i}. Variant ${VARIANT}. ` + 'x'.repeat(i * 100); // Разный размер
        filesToCreate.push({ name: `file${i}${ext}`, content, dir: '' });
    }

    // Файлы изображений (бинарные заглушки)
    for (let i = 13; i <= 22; i++) {
        const ext = i % 2 === 0 ? '.jpg' : '.png';
        // Создаем буфер ~50KB - 200KB
        const size = 50000 + (i * 10000); 
        const buffer = Buffer.alloc(size, i); 
        filesToCreate.push({ name: `img${i}${ext}`, content: buffer, dir: 'images' });
    }

    // Большие файлы (> 1MB) для теста чанков
    const bigBuffer = Buffer.alloc(1.5 * 1024 * 1024, 'A'); // 1.5 MB
    filesToCreate.push({ name: 'large_data.bin', content: bigBuffer, dir: '' });

    // Запись файлов
    filesToCreate.forEach(f => {
        const dirPath = f.dir ? path.join(SOURCE_DIR, f.dir) : SOURCE_DIR;
        const filePath = path.join(dirPath, f.name);
        fs.writeFileSync(filePath, f.content);
    });

    // Manifest
    const manifest = {
        created: new Date().toISOString(),
        variant: VARIANT,
        files: filesToCreate.map(f => f.name)
    };
    fs.writeFileSync(path.join(SOURCE_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log(`Структура создана. Всего файлов: ${filesToCreate.length + 1}`);
}

// Вспомогательная функция копирования файла
function copyFile(src, dest) {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(src);
        const writeStream = fs.createWriteStream(dest);
        
        readStream.pipe(writeStream);
        
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        readStream.on('error', reject);
    });
}

// 2. Копирование с фильтрацией
async function backupFiles() {
    console.log(`\nНачало копирования из ${SOURCE_DIR} в ${BACKUP_DIR}...`);
    const startTime = process.hrtime.bigint();

    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Рекурсивный обход
    function getFilesRecursively(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(getFilesRecursively(filePath));
            } else {
                results.push(filePath);
            }
        });
        return results;
    }

    const allFiles = getFilesRecursively(SOURCE_DIR);
    let copiedCount = 0;
    let streamCount = 0;
    let normalCount = 0;

    for (const srcPath of allFiles) {
        const relativePath = path.relative(SOURCE_DIR, srcPath);
        const destPath = path.join(BACKUP_DIR, relativePath);
        
        // Создаем папку назначения если нужно
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const ext = path.extname(srcPath).toLowerCase();
        const stats = fs.statSync(srcPath);
        const isLarge = stats.size > 1024 * 1024; // > 1MB

        // Логика выбора метода копирования
        const textExts = ['.txt', '.js', '.json'];
        const imgExts = ['.jpg', '.png', '.gif'];

        let method = 'normal';
        
        // Варианты 1-5: Сжатие текстовых (удаление пробелов)
        if (VARIANT >= 1 && VARIANT <= 5 && textExts.includes(ext)) {
             // Для простоты читаем, сжимаем и пишем (можно было бы через transform stream)
             const content = fs.readFileSync(srcPath, 'utf8');
             const compressed = content.replace(/\s+/g, ' '); // Упрощенное "сжатие"
             fs.writeFileSync(destPath, compressed);
             method = 'compressed_stream';
             streamCount++;
        } 
        else if (textExts.includes(ext)) {
            await copyFile(srcPath, destPath);
            method = 'stream';
            streamCount++;
        } else if (imgExts.includes(ext)) {
            fs.copyFileSync(srcPath, destPath);
            method = 'normal';
            normalCount++;
        } else {
            // Для больших файлов и остальных
            if (isLarge) {
                // Копирование через потоки автоматически работает чанками, 
                // но явно указать highWaterMark можно в createReadStream
                const rs = fs.createReadStream(srcPath, { highWaterMark: 512 * 1024 }); // 512 KB chunk
                const ws = fs.createWriteStream(destPath);
                await new Promise((res, rej) => {
                    rs.pipe(ws);
                    ws.on('finish', res);
                    ws.on('error', rej);
                });
                method = 'chunked_stream';
                streamCount++;
            } else {
                fs.copyFileSync(srcPath, destPath);
                method = 'normal';
                normalCount++;
            }
        }
        
        copiedCount++;
        // Прогресс
        if (copiedCount % 5 === 0 || copiedCount === allFiles.length) {
             console.log(`Копирование: ${copiedCount}/${allFiles.length} файлов`);
        }
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000_000;

    console.log(`\nКопирование завершено!`);
    console.log(`Статистика:`);
    console.log(`- Скопировано файлов: ${copiedCount}`);
    console.log(`- Потоковое/Сжатое: ${streamCount}`);
    console.log(`- Обычное: ${normalCount}`);
    console.log(`- Время: ${duration.toFixed(2)} сек`);

    return { source: SOURCE_DIR, backup: BACKUP_DIR };
}

// 3. Синхронизация и сравнение
function compareDirectories(source, backup) {
    console.log(`\nСравнение директорий...`);
    
    function getRelativeFiles(dir, base) {
        let files = {};
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            const relPath = path.relative(base, fullPath);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                Object.assign(files, getRelativeFiles(fullPath, base));
            } else {
                files[relPath] = {
                    size: stat.size,
                    mtime: stat.mtimeMs,
                    path: fullPath
                };
            }
        });
        return files;
    }

    const srcFiles = getRelativeFiles(source, source);
    const bakFiles = getRelativeFiles(backup, backup);

    const added = [];
    const deleted = [];
    const modified = [];
    const same = [];

    // Проверка на удаление и изменение
    for (const [name, info] of Object.entries(srcFiles)) {
        if (!bakFiles[name]) {
            deleted.push(name);
        } else {
            const bakInfo = bakFiles[name];
            // Сравнение по размеру и времени изменения (для простоты)
            // Для вариантов 6-10 можно добавить MD5
            let isChanged = false;
            
            if (VARIANT >= 6 && VARIANT <= 10 && info.size > 500 * 1024) {
                 // Проверка MD5 для больших файлов
                 const hashSrc = crypto.createHash('md5').update(fs.readFileSync(info.path)).digest('hex');
                 const hashBak = crypto.createHash('md5').update(fs.readFileSync(bakInfo.path)).digest('hex');
                 if (hashSrc !== hashBak) isChanged = true;
            } else {
                 if (info.size !== bakInfo.size || Math.abs(info.mtime - bakInfo.mtime) > 1000) {
                     isChanged = true;
                 }
            }

            if (isChanged) {
                modified.push(name);
            } else {
                same.push(name);
            }
        }
    }

    // Проверка на добавленные
    for (const name of Object.keys(bakFiles)) {
        if (!srcFiles[name]) {
            added.push(name);
        }
    }

    // Формирование отчета
    const reportContent = `Отчет синхронизации (Вариант ${VARIANT})\nДата: ${new Date().toLocaleString()}\n\n` +
        `Совпадают: ${same.length} файлов\n` +
        `Изменены: ${modified.length} файлов\n` +
        `Добавлены в backup: ${added.length} файлов\n` +
        `Удалены из source: ${deleted.length} файлов\n\n` +
        (modified.length > 0 ? `Измененные файлы:\n${modified.join('\n')}\n` : '') +
        (added.length > 0 ? `Добавленные файлы:\n${added.join('\n')}\n` : '');

    fs.writeFileSync(REPORT_FILE, reportContent, 'utf8');

    console.log(`\nРезультаты сравнения:`);
    console.log(`- Совпадают: ${same.length}`);
    console.log(`- Изменены: ${modified.length}`);
    console.log(`- Добавлены: ${added.length}`);
    console.log(`- Удалены: ${deleted.length}`);
    console.log(`Отчет сохранен в: ${REPORT_FILE}`);
}

// Основной запуск
async function main() {
    try {
        createTestStructure();
        await backupFiles();
        compareDirectories(SOURCE_DIR, BACKUP_DIR);
    } catch (err) {
        console.error('Ошибка выполнения:', err);
    }
}

main();
