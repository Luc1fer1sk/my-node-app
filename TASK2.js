const fs = require('fs/promises');
const path = require('path');

// Вспомогательная функция для рекурсивного вывода дерева каталогов
// Использует символы ├──, └──, │ для классического отображения дерева
async function printTree(dir, prefix = '', isLast = true) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const fullPath = path.join(dir, entry.name);
            const last = i === entries.length - 1;
            
            // Выбираем соединитель: └── для последнего элемента, ├── для остальных
            const connector = last ? '└── ' : '├── ';
            console.log(`${prefix}${connector}${entry.name}`);
            
            // Если это папка, рекурсивно вызываем функцию для её содержимого
            if (entry.isDirectory()) {
                // Для вложенных уровней: если текущий элемент последний — добавляем пробелы,
                // иначе добавляем вертикальную черту │ для визуальной связи
                const newPrefix = prefix + (last ? '    ' : '│   ');
                await printTree(fullPath, newPrefix, last);
            }
        }
    } catch (error) {
        console.error(`Ошибка чтения директории ${dir}:`, error.message);
    }
}

async function task2() {
    try {
        const baseDir = path.join(process.cwd(), 'project_16');
        const currentDate = new Date().toLocaleDateString('ru-RU');

        // 1. Структура каталогов
        const folders = [
            'src/modules',
            'src/components',
            'src/utils',
            'data/input',
            'data/output',
            'temp'
        ];

        console.log('Создание структуры каталогов...');
        // Создаем все папки рекурсивно
        for (const folder of folders) {
            await fs.mkdir(path.join(baseDir, folder), { recursive: true });
        }

        // 2. Создание файлов info.txt и README.md (т.к. вариант 16 - четный)
        const descriptions = {
            'src': 'Исходный код проекта',
            'src/modules': 'Модули и бизнес-логика',
            'src/components': 'UI компоненты',
            'src/utils': 'Вспомогательные утилиты',
            'data': 'Данные проекта',
            'data/input': 'Входные данные',
            'data/output': 'Выходные данные',
            'temp': 'Временные файлы'
        };

        for (const folder of folders) {
            const folderPath = path.join(baseDir, folder);
            const parentFolder = path.basename(path.dirname(folderPath)) === 'project_16' 
                                 ? path.basename(folderPath) 
                                 : `${path.basename(path.dirname(folderPath))}/${path.basename(folderPath)}`;
            
            // Записываем info.txt
            await fs.writeFile(
                path.join(folderPath, 'info.txt'), 
                `Назначение папки: ${descriptions[parentFolder] || descriptions[folder] || 'Служебная папка'}`, 
                'utf-8'
            );

            // Вариант 16 (четный): создаем README.md с текущей датой в КАЖДОЙ папке
            await fs.writeFile(
                path.join(folderPath, 'README.md'), 
                `# ${parentFolder}\nДата создания: ${currentDate}`, 
                'utf-8'
            );
        }

        // 3. Вывод начального дерева
        console.log('\n--- НАЧАЛЬНОЕ ДЕРЕВО СТРУКТУРЫ ---');
        console.log('project_16/');
        await printTree(baseDir);
        console.log('------------------------------------\n');

        // 4. Перемещаем папку temp внутрь data (temp -> data/temp)
        await fs.rename(path.join(baseDir, 'temp'), path.join(baseDir, 'data', 'temp'));
        
        // 5. Переименовываем data/output в data/results
        await fs.rename(path.join(baseDir, 'data', 'output'), path.join(baseDir, 'data', 'results'));

        // 6. Удаляем папку temp (которая теперь находится в data/temp) со всем содержимым
        await fs.rm(path.join(baseDir, 'data', 'temp'), { recursive: true, force: true });

        // 7. Вывод обновленного дерева
        console.log('--- ОБНОВЛЕННОЕ ДЕРЕВО СТРУКТУРЫ ---');
        console.log('project_16/');
        await printTree(baseDir);
        console.log('------------------------------------');

    } catch (error) {
        console.error('Ошибка при выполнении Задания 2:', error.message);
    }
}

task2();