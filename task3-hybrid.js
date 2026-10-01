const fs = require('fs');
const path = require('path');
const util = require('util');

const fsPromises = {
    writeFile: util.promisify(fs.writeFile),
    readFile: util.promisify(fs.readFile),
    unlink: util.promisify(fs.unlink),
    stat: util.promisify(fs.stat),
    readdir: util.promisify(fs.readdir),
    mkdir: util.promisify(fs.mkdir)
};

class FileOperationError extends Error {
    constructor(message, operation, filePath, originalError) {
        super(message);
        this.name = 'FileOperationError';
        this.operation = operation;
        this.filePath = filePath;
        this.originalError = originalError;
    }
}

class FileManagerHybrid {
    constructor(baseDir = './data-hybrid') {
        this.baseDir = baseDir;
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
            console.log(`Создана директория: ${baseDir}`);
        }
    }

    _handleAsync(promiseFn, callback) {
        const promise = promiseFn();
        
        if (typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err, null));
            return undefined;
        }
        
        return promise;
    }

    createFile(filename, content, callback) {
        return this._handleAsync(async () => {
            try {
                const filePath = path.join(this.baseDir, filename);
                await fsPromises.writeFile(filePath, content, 'utf8');
                return filePath;
            } catch (err) {
                throw new FileOperationError(
                    `Не удалось создать файл ${filename}`, 
                    'create', 
                    filename, 
                    err
                );
            }
        }, callback);
    }

    readFile(filename, callback) {
        return this._handleAsync(async () => {
            try {
                const filePath = path.join(this.baseDir, filename);
                return await fsPromises.readFile(filePath, 'utf8');
            } catch (err) {
                throw new FileOperationError(
                    `Не удалось прочитать файл ${filename}`, 
                    'read', 
                    filename, 
                    err
                );
            }
        }, callback);
    }

    deleteFile(filename, callback) {
        return this._handleAsync(async () => {
            try {
                const filePath = path.join(this.baseDir, filename);
                await fsPromises.unlink(filePath);
            } catch (err) {
                throw new FileOperationError(
                    `Не удалось удалить файл ${filename}`, 
                    'delete', 
                    filename, 
                    err
                );
            }
        }, callback);
    }
}

async function runDemo() {
    const manager = new FileManagerHybrid('./test-hybrid-data');

    console.log('\nТест 1: Использование через Promises / Async-Await');
    try {
        const p = await manager.createFile('promise-file.txt', 'Создан через промис');
        console.log(`Файл создан: ${p}`);
        
        const content = await manager.readFile('promise-file.txt');
        console.log(`Содержимое: "${content}"`);

        await manager.readFile('non-existent.txt');
    } catch (e) {
        console.error(`Ошибка: [${e.name}] ${e.message}`);
        if (e instanceof FileOperationError) {
            console.error(`   Операция: ${e.operation}, Файл: ${e.filePath}`);
        }
    }

    console.log('\nТест 2: Использование через Callbacks');
    manager.createFile('callback-file.txt', 'Создан через колбэк', (err, filePath) => {
        if (err) {
            console.error(`Ошибка создания: ${err.message}`);
            return;
        }
        console.log(`Файл создан: ${filePath}`);

        manager.readFile('callback-file.txt', (err, content) => {
            if (err) {
                console.error(`Ошибка чтения: ${err.message}`);
                return;
            }
            console.log(`Содержимое: "${content}"`);
            
            manager.deleteFile('promise-file.txt', () => {});
            manager.deleteFile('callback-file.txt', () => {
                console.log('\nДемонстрация гибридного режима завершена');
            });
        });
    });
}

runDemo();
