// Подключаем модули fs.promises для асинхронной работы и path для работы с путями
const fs = require('fs/promises');
const path = require('path');

async function task1() {
    try {
        // Формируем относительный путь к файлу относительно текущей директории
        const fileName = 'student_16.txt';
        const filePath = path.join(process.cwd(), fileName);

        // 1. Формируем данные для записи
        const studentName = 'Овчинников Денис Владимирович';
        const groupNumber = '477';
        const variantNumber = '16';
        const currentDate = new Date().toLocaleString('ru-RU');
        
        // Список из 5 любимых книг/фильмов
        const favorites = [
            '1. Мастер и Маргарита (М. Булгаков)',
            '2. Преступление и наказание (Ф. Достоевский)',
            '3. Интерстеллар (фильм)',
            '4. 1984 (Дж. Оруэлл)',
            '5. Дом который посторил Джек (фильм)'
        ].join('\n');

        // Собираем основной контент
        let content = `Студент: ${studentName}\n` +
                      `Группа: ${groupNumber}\n` +
                      `Варинт: ${variantNumber}\n` +
                      `Дата и время: ${currentDate}\n` +
                      `Любимые книги/фильмы:\n${favorites}`;

        // 2. Записываем данные в файл
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`Файл ${fileName} успешно создан.`);

        // 3. Считаем количество строк и добавляем информацию в конец
        // Разбиваем контент по переносу строк для подсчета
        const linesCount = content.split('\n').length;
        const appendContent = `\nКоличество записей: ${linesCount}`;
        
        await fs.appendFile(filePath, appendContent, 'utf-8');
        console.log('Информация о количестве записей добавлена.');

        // 4. Читаем файл и выводим в консоль в отформатированном виде
        // Файл небольшой (< 1 МБ), поэтому читаем целиком
        const finalContent = await fs.readFile(filePath, 'utf-8');
        
        console.log('\n' + '='.repeat(40));
        console.log('СОДЕРЖИМОЕ ФАЙЛА:');
        console.log('='.repeat(40));
        console.log(finalContent);
        console.log('='.repeat(40) + '\n');

    } catch (error) {
        // Обработка всех возможных ошибок
        console.error('Ошибка при выполнении Задания 1:', error.message);
    }
}

// Запуск программы
task1();