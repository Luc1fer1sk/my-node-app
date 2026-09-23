const fs = require('fs/promises');
const path = require('path');

// Функция для получения размера файла. 
// Для файлов > 1 МБ используем потоки (createReadStream), обернутые в Promise.
async function getFileSize(filePath, initialStat) {
    if (initialStat.size > 1024 * 1024) { // Если больше 1 МБ
        return new Promise((resolve, reject) => {
            let size = 0;
            // fs.createReadStream не входит в fs.promises, но это стандартный способ работы с потоками
            const stream = require('fs').createReadStream(filePath);
            stream.on('data', (chunk) => { size += chunk.length; });
            stream.on('end', () => resolve(size));
            stream.on('error', (err) => reject(err));
        });
    }
    return initialStat.size;
}

// Рекурсивная функция сканирования
async function scanDirectory(dir, stats) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                stats.foldersCount++;
                await scanDirectory(fullPath, stats);
            } else if (entry.isFile()) {
                const stat = await fs.stat(fullPath);
                const fileSize = await getFileSize(fullPath, stat);
                
                stats.filesCount++;
                stats.totalSizeBytes += fileSize;
                
                // Сохраняем информацию о файле для топ-5 и группировки
                const ext = path.extname(entry.name).toLowerCase() || 'без расширения';
                if (!stats.extensions[ext]) stats.extensions[ext] = [];
                stats.extensions[ext].push({ name: entry.name, size: fileSize, path: fullPath });

                // Специфика варианта 16: поиск файлов с "16" в названии
                if (entry.name.includes('16')) {
                    stats.filesWithVariant.push({ name: entry.name, path: fullPath });
                }

                stats.allFiles.push({ name: entry.name, size: fileSize, path: fullPath });
            }
        }
    } catch (error) {
        console.error(`Ошибка доступа к ${dir}:`, error.message);
    }
}

async function task3() {
    try {
        // 1. Получаем путь из аргументов командной строки или используем текущую директорию
        const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
        
        // Проверка существования директории
        await fs.access(targetDir);

        console.log(`Сканирование директории: ${targetDir}\nПожалуйста, подождите...`);

        // Инициализация счетчиков
        const stats = {
            filesCount: 0,
            foldersCount: 0,
            totalSizeBytes: 0,
            extensions: {},
            allFiles: [],
            filesWithVariant: [] // Для варианта 16
        };

        // 2. Рекурсивное сканирование
        await scanDirectory(targetDir, stats);

        // 3. Форматирование размеров
        const sizeB = stats.totalSizeBytes;
        const sizeKB = (sizeB / 1024).toFixed(2);
        const sizeMB = (sizeB / (1024 * 1024)).toFixed(2);

        // Сортировка для Топ-5
        const sortedBySizeDesc = [...stats.allFiles].sort((a, b) => b.size - a.size);
        const sortedBySizeAsc = [...stats.allFiles].sort((a, b) => a.size - b.size);

        // Вывод статистики в консоль
        console.log('\n=== СТАТИСТИКА ДИРЕКТОРИИ ===');
        console.log(`Общее количество файлов: ${stats.filesCount}`);
        console.log(`Общее количество папок: ${stats.foldersCount}`);
        console.log(`Общий размер: ${sizeB} байт | ${sizeKB} КБ | ${sizeMB} МБ`);
        
        console.log('\nФайлы по расширениям:');
        for (const [ext, files] of Object.entries(stats.extensions)) {
            console.log(`  ${ext}: ${files.length} шт.`);
        }

        console.log('\nТоп-5 самых больших файлов:');
        sortedBySizeDesc.slice(0, 5).forEach((f, i) => {
            console.log(`  ${i + 1}. ${f.name} (${(f.size / 1024).toFixed(2)} КБ)`);
        });

        console.log('\nТоп-5 самых маленьких файлов:');
        sortedBySizeAsc.slice(0, 5).forEach((f, i) => {
            console.log(`  ${i + 1}. ${f.name} (${f.size} байт)`);
        });

        // Специфика варианта 16
        console.log('\nФайлы, содержащие "16" в названии:');
        if (stats.filesWithVariant.length > 0) {
            stats.filesWithVariant.forEach(f => console.log(`  - ${f.name} (${f.path})`));
        } else {
            console.log('  Файлы не найдены.');
        }
        console.log('=============================\n');

        // 4. Создание файла отчета report_16.json
        const reportPath = path.join(process.cwd(), 'report_16.json');
        
        // Формируем объект для JSON (убираем абсолютные пути для чистоты отчета, оставляем относительные)
        const reportData = {
            scanDirectory: path.relative(process.cwd(), targetDir) || '.',
            stats: {
                totalFiles: stats.filesCount,
                totalFolders: stats.foldersCount,
                totalSize: { bytes: sizeB, kb: sizeKB, mb: sizeMB }
            },
            filesByExtension: Object.fromEntries(
                Object.entries(stats.extensions).map(([ext, files]) => [ext, files.length])
            ),
            top5Largest: sortedBySizeDesc.slice(0, 5).map(f => ({ name: f.name, sizeBytes: f.size })),
            top5Smallest: sortedBySizeAsc.slice(0, 5).map(f => ({ name: f.name, sizeBytes: f.size })),
            filesContainingVariant16: stats.filesWithVariant.map(f => path.relative(process.cwd(), f.path))
        };

        // Записываем JSON (файл небольшой, пишем целиком)
        await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
        console.log(`Отчет успешно сохранен в: ${reportPath}`);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Указанная директория не найдена.');
        } else {
            console.error('Ошибка при выполнении Задания 3:', error.message);
        }
    }
}

task3();