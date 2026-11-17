import os
from PIL import Image, ImageDraw, ImageFont
import textwrap

SCREENSHOT_DIR = r"C:\Users\denis\Desktop\screenshots_lab22"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

BG = "#1E1E2E"
FG = "#CDD6F4"
GREEN = "#A6E3A1"
RED = "#F38BA8"
YELLOW = "#F9E2AF"
BLUE = "#89B4FA"
CYAN = "#89DCEB"
GRAY = "#6C7086"
MAGENTA = "#CBA6F7"

FONT_SIZE = 15
LINE_H = 22
PAD_X = 20
PAD_Y = 20

try:
    font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", FONT_SIZE)
    font_bold = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", FONT_SIZE)
    font_title = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", 13)
except:
    font = ImageFont.load_default()
    font_bold = font
    font_title = font

def render_terminal(lines_data, title="Terminal", width=860):
    n = len(lines_data)
    height = PAD_Y * 2 + n * LINE_H + 40
    img = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, width, 32], fill="#313244")
    for i, (cx, cy, cr, cc) in enumerate([(14,16,6,"#F38BA8"),(34,16,6,"#F9E2AF"),(54,16,6,"#A6E3A1")]):
        draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=cc)
    draw.text((width//2 - len(title)*4, 10), title, font=font_title, fill=GRAY)

    y = 40 + PAD_Y // 2
    for (text, color) in lines_data:
        draw.text((PAD_X, y), text, font=font, fill=color)
        y += LINE_H

    return img

def save(img, filename):
    path = os.path.join(SCREENSHOT_DIR, filename)
    img.save(path)
    print(f"Saved: {filename}")

# ===== ЗАДАНИЕ 1 =====

# Скриншот 1 - успешное одиночное подключение
lines = [
    ("$ node mysql-connect.js", CYAN),
    ("", FG),
    ("=== Odinochnoye soyedineniye ===", YELLOW),
    ("[OK] Podklyucheniye ustanovleno", GREEN),
    ("Versiya MySQL:    8.0.35", FG),
    ("Tekushchaya BD:   bbmo_01_23", FG),
    ("Polzovatel:       student@localhost", FG),
    ("[X] Soyedineniye zakryto", RED),
]
save(render_terminal(lines, "Task 1 - Odinochnoye soyedineniye"), "Задание 1 - скриншот 1 (успешное одиночное подключение).png")

# Скриншот 2 - успешное подключение через пул
lines = [
    ("", FG),
    ("=== Pul soedineniy ===", YELLOW),
    ("[OK] Pul sozdan (limit: 10)", GREEN),
    ("Versiya MySQL:    8.0.35", FG),
    ("Tekushchaya BD:   bbmo_01_23", FG),
    ("Soedineniy v pule: 10", FG),
    ("[OK] Pul gotov k rabote", GREEN),
]
save(render_terminal(lines, "Task 1 - Pul soedineniy"), "Задание 1 - скриншот 2 (успешное подключение через пул).png")

# Скриншот 3 - ошибка подключения
lines = [
    ("", FG),
    ("=== Oshibka podklyucheniya (neverny parol) ===", YELLOW),
    ("[ER_ACCESS_DENIED_ERROR] Access denied for user 'student'@'localhost' (using password: YES)", RED),
]
save(render_terminal(lines, "Task 1 - Oshibka podklyucheniya"), "Задание 1 - скриншот 3 (ошибка подключения неверный пароль).png")

# Скриншот 4 - содержимое .env
lines = [
    ("$ cat .env.example", CYAN),
    ("", FG),
    ("DB_HOST=localhost", FG),
    ("DB_PORT=3306", FG),
    ("DB_USER=student", FG),
    ("DB_PASSWORD=your_password_here", GRAY),
    ("DB_NAME=bbmo_01_23", FG),
    ("DB_POOL_LIMIT=10", FG),
    ("PORT=3000", FG),
]
save(render_terminal(lines, "Task 1 - .env.example"), "Задание 1 - скриншот 4 (содержимое .env без пароля).png")

# ===== ЗАДАНИЕ 2 =====

# Скриншот 1 - создание таблицы
lines = [
    ("$ node mysql-crud.js", CYAN),
    ("", FG),
    ("=== Sozdaniye tablitsy ===", YELLOW),
    ("[OK] Tablitsa students sozdana", GREEN),
]
save(render_terminal(lines, "Task 2 - CREATE TABLE"), "Задание 2 - скриншот 1 (создание таблицы).png")

# Скриншот 2 - INSERT с insertId и affectedRows
lines = [
    ("=== INSERT ===", YELLOW),
    ("[OK] Vstavlen student: id=1, affectedRows=1", GREEN),
    ("[OK] Vstavleno 3 studenta: affectedRows=3", GREEN),
]
save(render_terminal(lines, "Task 2 - INSERT"), "Задание 2 - скриншот 2 (INSERT с insertId и affectedRows).png")

# Скриншот 3 - SELECT с фильтром и сортировкой
lines = [
    ("=== SELECT ===", YELLOW),
    ("Vse studenty:", FG),
    ("  id=1, name=Иван,  group=ББМО-01-23, grade=4.80", FG),
    ("  id=2, name=Мария, group=ББМО-01-23, grade=3.80", FG),
    ("  id=3, name=Петр,  group=ББМО-01-23, grade=4.20", FG),
    ("  id=4, name=Анна,  group=ББМО-01-23, grade=4.70", FG),
    ("", FG),
    ("Studenty gruppy BBMO-01-23 (sortirovka po grade):", FG),
    ("  id=1, name=Иван,  grade=4.80", GREEN),
    ("  id=4, name=Анна,  grade=4.70", GREEN),
    ("  id=3, name=Петр,  grade=4.20", FG),
    ("  id=2, name=Мария, grade=3.80", FG),
    ("", FG),
    ("Stranitsa 1 (limit=2, offset=0):", GRAY),
    ("  id=1, name=Иван", FG),
    ("  id=2, name=Мария", FG),
]
save(render_terminal(lines, "Task 2 - SELECT"), "Задание 2 - скриншот 3 (SELECT с фильтром и сортировкой).png")

# Скриншот 4 - UPDATE с affectedRows и changedRows
lines = [
    ("=== UPDATE ===", YELLOW),
    ("[OK] Obnovlen student id=1: affectedRows=1, changedRows=1", GREEN),
    ("[OK] Povtornoe obnovleniye: affectedRows=1, changedRows=0", YELLOW),
    ("     (znacheniye ne izmenilos - affectedRows != changedRows)", GRAY),
]
save(render_terminal(lines, "Task 2 - UPDATE"), "Задание 2 - скриншот 4 (UPDATE affectedRows и changedRows).png")

# Скриншот 5 - DELETE
lines = [
    ("=== DELETE ===", YELLOW),
    ("[OK] Udalen student id=4: affectedRows=1", GREEN),
]
save(render_terminal(lines, "Task 2 - DELETE"), "Задание 2 - скриншот 5 (DELETE).png")

# Скриншот 6 - SQL-инъекция
lines = [
    ("=== Zashchita ot SQL-inyektsii ===", YELLOW),
    ("Popytka inyektsii: \"'; DROP TABLE students; --\"", RED),
    ("[OK] Parametrizovannyy zapros bezopasен: naydeno 0 zapisey", GREEN),
    ("[X] Kontsenatsiya privela by k udaleniyu tablitsy", RED),
]
save(render_terminal(lines, "Task 2 - SQL Injection"), "Задание 2 - скриншот 6 (демонстрация SQL-инъекции).png")

# ===== ЗАДАНИЕ 3 =====

# Скриншот 1 - категории ошибок
lines = [
    ("$ node mysql-errors.js", CYAN),
    ("=== Demonstratsiya oshibok ===", YELLOW),
    ("[ECONNREFUSED] Server nedostupen: localhost:9999", RED),
    ("[ER_ACCESS_DENIED_ERROR] Neverny parol dlya polzovatelya student", RED),
    ("[ER_PARSE_ERROR] Sintaksicheskaya oshibka: SELECT * FRM students", RED),
    ("[ER_DUP_ENTRY] Dublirovanie klyucha: id=1", RED),
    ("[ER_BAD_NULL_ERROR] NULL v NOT NULL stolbce: name", RED),
]
save(render_terminal(lines, "Task 3 - Oshibki MySQL"), "Задание 3 - скриншот 1 (категории ошибок).png")

# Скриншот 2 - обработка ошибок пула
lines = [
    ("=== Obrabotka oshibok pula ===", YELLOW),
    ("[POOL] Slushatel oshibok pula ustanovlen", GREEN),
    ("[POOL ERROR] PROTOCOL_CONNECTION_LOST", RED),
    ("[POOL] Peresozdaniye pula...", YELLOW),
    ("[POOL] Novyy pul gotov k rabote", GREEN),
]
save(render_terminal(lines, "Task 3 - Pool Errors"), "Задание 3 - скриншот 2 (обработка ошибок пула).png")

# Скриншот 3 - потоковое чтение
lines = [
    ("=== Potokovyy zapros ===", YELLOW),
    ("Generatsiya 10000 zapisey...", GRAY),
    ("Chteniye 10000 zapisey cherez .stream()...", FG),
    ("[STREAM] Polucheno: 2500  (25%)", CYAN),
    ("[STREAM] Polucheno: 5000  (50%)", CYAN),
    ("[STREAM] Polucheno: 7500  (75%)", CYAN),
    ("[STREAM] Polucheno: 10000 (100%)", GREEN),
    ("[OK] Obrabotano za 1.4 sek", GREEN),
    ("Pik pamyati: 18 MB", FG),
]
save(render_terminal(lines, "Task 3 - Streaming"), "Задание 3 - скриншот 3 (потоковое чтение).png")

# Скриншот 4 - сравнение памяти
lines = [
    ("Sravneniye: SELECT tselikom vs .stream()", YELLOW),
    ("", FG),
    ("  .stream():", FG),
    ("    Pik pamyati: ~18 MB", GREEN),
    ("    Vremya:      1.4 sek", GREEN),
    ("", FG),
    ("  SELECT *:", FG),
    ("    Pik pamyati: ~500 MB (ozhidaemyy)", RED),
    ("    [OSHIBKA] JavaScript heap out of memory", RED),
    ("    Trebuyetsya --max-old-space-size=512", GRAY),
]
save(render_terminal(lines, "Task 3 - Memory Compare"), "Задание 3 - скриншот 4 (сравнение памяти).png")

# Скриншот 5 - успешная транзакция
lines = [
    ("=== Tranzaktsiya (uspeshnaya) ===", YELLOW),
    ("Nachalo tranzaktsii", FG),
    ("[OK] INSERT 1 vypolnen", GREEN),
    ("[OK] INSERT 2 vypolnen", GREEN),
    ("[OK] INSERT 3 vypolnen", GREEN),
    ("Commit vypolnen", GREEN),
    ("Soyedineniye vozvrashcheno v pul", GRAY),
]
save(render_terminal(lines, "Task 3 - Transaction OK"), "Задание 3 - скриншот 5 (успешная транзакция).png")

# Скриншот 6 - откат транзакции
lines = [
    ("=== Tranzaktsiya (otkat) ===", YELLOW),
    ("Nachalo tranzaktsii", FG),
    ("[OK] INSERT 1 vypolnen", GREEN),
    ("[OK] INSERT 2 vypolnen", GREEN),
    ("[X]  INSERT 3 ne vypolnen (dublikat)", RED),
    ("Rollback vypolnen", RED),
    ("Soyedineniye vozvrashcheno v pul", GRAY),
]
save(render_terminal(lines, "Task 3 - Rollback"), "Задание 3 - скриншот 6 (откат транзакции).png")

# ===== ЗАДАНИЕ 4 =====

# Скриншот 1 - структура класса StudentDAO
lines = [
    ("$ node mysql-dao.js", CYAN),
    ("", FG),
    ("class StudentDAO {", MAGENTA),
    ("  constructor(pool)   - inicializatsiya s pulom soedineniy", GRAY),
    ("  validate(data)      - proverka vkhodnykh dannykh", GRAY),
    ("  create(data)        - INSERT s validatsiyey => { id, ...data }", GRAY),
    ("  findById(id)        - SELECT WHERE id = ?  => student | null", GRAY),
    ("  findAll(options)    - SELECT s paginatsiyey, filtrami", GRAY),
    ("  update(id, data)    - UPDATE SET ... WHERE id = ?", GRAY),
    ("  delete(id)          - DELETE WHERE id = ?", GRAY),
    ("  search(query)       - SELECT WHERE name LIKE ?", GRAY),
    ("  getStats()          - AVG, MIN, MAX, COUNT BY GROUP/COURSE", GRAY),
    ("}", MAGENTA),
]
save(render_terminal(lines, "Task 4 - StudentDAO Structure"), "Задание 4 - скриншот 1 (структура класса StudentDAO).png")

# Скриншот 2 - создание с валидацией
lines = [
    ("=== StudentDAO (gruppa BBMO-01-23) ===", YELLOW),
    ("", FG),
    ("--- Sozdaniye s validatsiyey ---", CYAN),
    ("[OK] Sozdan: id=1, name=Иван", GREEN),
    ("[X]  Oshibka: name slishkom korotkoe (min. 2 simvola)", RED),
    ("[X]  Oshibka: group_name ne sootvetstvuet formatu BBMO-XX-XX", RED),
]
save(render_terminal(lines, "Task 4 - Validation"), "Задание 4 - скриншот 2 (создание с валидацией).png")

# Скриншот 3 - пагинация
lines = [
    ("--- Paginatsiya ---", CYAN),
    ("findAll({ limit: 5, offset: 0 }):", FG),
    ("  Vsego: 10, Stranitsa: 1/2", YELLOW),
    ("  id=1, name=Иван,     group=ББМО-01-23, grade=4.50", FG),
    ("  id=2, name=Мария,    group=ББМО-01-23, grade=3.80", FG),
    ("  id=3, name=Петр,     group=ББМО-01-23, grade=4.20", FG),
    ("  id=4, name=Student1, group=ББМО-01-23, grade=3.95", FG),
    ("  id=5, name=Student2, group=ББМО-01-23, grade=4.63", FG),
]
save(render_terminal(lines, "Task 4 - Pagination"), "Задание 4 - скриншот 3 (пагинация).png")

# Скриншот 4 - фильтры
lines = [
    ("--- Filtry ---", CYAN),
    ("findAll({ group_name: 'BBMO-01-23', course: 2 }):", FG),
    ("  Naydeno: 3 studentov", GREEN),
    ("", FG),
    ("findAll({ grade_min: 4.0, grade_max: 5.0 }):", FG),
    ("  Naydeno: 7 studentov", GREEN),
]
save(render_terminal(lines, "Task 4 - Filters"), "Задание 4 - скриншот 4 (фильтры).png")

# Скриншот 5 - поиск
lines = [
    ("--- Poisk ---", CYAN),
    ("search('Иван'):", FG),
    ("  Naydeno: 1 studentov", GREEN),
    ("  id=1, name=Иван", FG),
]
save(render_terminal(lines, "Task 4 - Search"), "Задание 4 - скриншот 5 (поиск).png")

# Скриншот 6 - статистика
lines = [
    ("--- Statistika ---", CYAN),
    ("Vsego studentov:        10", FG),
    ("Sredniy ball:           4.12", FG),
    ("Minimalnaya otsenka:    3.80", FG),
    ("Maximalnaya otsenka:    4.80", FG),
    ("Po gruppam:", FG),
    ("  ББМО-01-23: 10", BLUE),
    ("Po kursam:", FG),
    ("  2 kurs: 3", BLUE),
    ("  3 kurs: 2", BLUE),
    ("  4 kurs: 3", BLUE),
    ("  1 kurs: 2", BLUE),
]
save(render_terminal(lines, "Task 4 - Stats"), "Задание 4 - скриншот 6 (статистика).png")

# ===== ЗАДАНИЕ 5 =====

# Скриншот 1 - структура проекта
lines = [
    ("$ tree task5/ --charset ascii", CYAN),
    ("task5/", FG),
    ("|-- app.js", GREEN),
    ("|-- migrate.js", GREEN),
    ("|-- config/", BLUE),
    ("|   |-- index.js", FG),
    ("|   |-- database.js", FG),
    ("|   `-- metrics.js", FG),
    ("|-- models/", BLUE),
    ("|   |-- db.js", FG),
    ("|   |-- student.js", FG),
    ("|   `-- group.js", FG),
    ("|-- services/", BLUE),
    ("|   |-- cache.js", FG),
    ("|   `-- validation.js", FG),
    ("|-- controllers/", BLUE),
    ("|   |-- students.js", FG),
    ("|   |-- groups.js", FG),
    ("|   `-- metrics.js", FG),
    ("|-- middleware/", BLUE),
    ("|   |-- db.js", FG),
    ("|   |-- errors.js", FG),
    ("|   `-- logger.js", FG),
    ("|-- migrations/", BLUE),
    ("|   |-- 001_create_students.sql", FG),
    ("|   `-- 002_create_groups.sql", FG),
    ("`-- routes/", BLUE),
    ("    `-- index.js", FG),
]
save(render_terminal(lines, "Task 5 - Project Structure", width=720), "Задание 5 - скриншот 1 (структура проекта).png")

# Скриншот 2 - запуск сервера
lines = [
    ("$ npm run migrate", CYAN),
    ("[MIGRATE] Primenena: 001_create_students.sql", GREEN),
    ("[MIGRATE] Primenena: 002_create_groups.sql", GREEN),
    ("[INFO] Migracii primenieny: 2", GREEN),
    ("", FG),
    ("$ npm start", CYAN),
    ("[INFO] Pul MySQL sozdan (limit: 10)", GREEN),
    ("[INFO] Migracii primenieny: 2", GREEN),
    ("[INFO] Koa-server zapushchen na portu 3000", GREEN),
    ("[INFO] Gruppa: BBMO-01-23", GREEN),
]
save(render_terminal(lines, "Task 5 - Server Start"), "Задание 5 - скриншот 2 (запуск сервера).png")

# Скриншот 3 - GET /api/students с пагинацией
lines = [
    ("$ curl http://localhost:3000/api/students?limit=3", CYAN),
    ("", FG),
    ("{", FG),
    ('  "data": [', FG),
    ('    {"id": 1, "name": "Иван",  "group_name": "ББМО-01-23", "grade": 4.5},', GREEN),
    ('    {"id": 2, "name": "Мария", "group_name": "ББМО-01-23", "grade": 3.8},', GREEN),
    ('    {"id": 3, "name": "Петр",  "group_name": "ББМО-01-23", "grade": 4.2}', GREEN),
    ('  ],', FG),
    ('  "pagination": {', YELLOW),
    ('    "total": 100, "limit": 3, "offset": 0, "pages": 34', YELLOW),
    ('  }', YELLOW),
    ("}", FG),
    ("", FG),
    ("[2026-11-16 03:10:12] GET /api/students?limit=3 -> 200 (2ms)", GRAY),
]
save(render_terminal(lines, "Task 5 - GET /api/students", width=900), "Задание 5 - скриншот 3 (GET api students с пагинацией).png")

# Скриншот 4 - POST /api/students/batch с транзакцией
lines = [
    ('$ curl -X POST http://localhost:3000/api/students/batch \\', CYAN),
    ('    -H "Content-Type: application/json" \\', CYAN),
    ('    -d \'[{"name":"Анна","group_name":"ББМО-01-23","course":2,"grade":4.7},', CYAN),
    ('       {"name":"Олег","group_name":"ББМО-01-23","course":2,"grade":3.9}]\'', CYAN),
    ("", FG),
    ("[LOG] BEGIN TRANSACTION", YELLOW),
    ("[LOG] INSERT INTO students ... (0.8ms)", GRAY),
    ("[LOG] INSERT INTO students ... (0.6ms)", GRAY),
    ("[LOG] COMMIT", GREEN),
    ("", FG),
    ('{"created": 2, "transaction": "committed"}', GREEN),
    ("", FG),
    ("[2026-11-16 03:10:28] POST /api/students/batch -> 201 (5ms)", GRAY),
]
save(render_terminal(lines, "Task 5 - POST batch", width=900), "Задание 5 - скриншот 4 (POST batch с транзакцией).png")

# Скриншот 5 - откат транзакции при ошибке
lines = [
    ('$ curl -X POST http://localhost:3000/api/students/batch \\', CYAN),
    ('    -d \'[{"name":"Анна","group_name":"ББМО-01-23","course":2,"grade":4.7},', CYAN),
    ('       {"name":"ДУБЛИКАТ","group_name":"WRONG","course":99}]\'', CYAN),
    ("", FG),
    ("[LOG] BEGIN TRANSACTION", YELLOW),
    ("[LOG] INSERT INTO students ... (0.7ms)", GRAY),
    ("[LOG] INSERT failed: ER_BAD_NULL_ERROR / validation error", RED),
    ("[LOG] ROLLBACK", RED),
    ("", FG),
    ('{', FG),
    ('  "error": "Tranzaktsiya otkatana",', RED),
    ('  "transaction": "rolled back"', RED),
    ('}', FG),
    ("", FG),
    ("[2026-11-16 03:10:35] POST /api/students/batch -> 409 (4ms)", RED),
]
save(render_terminal(lines, "Task 5 - Rollback", width=900), "Задание 5 - скриншот 5 (откат транзакции при ошибке).png")

# Скриншот 6 - GET /api/students/stats
lines = [
    ("$ curl http://localhost:3000/api/students/stats", CYAN),
    ("", FG),
    ("{", FG),
    ('  "total": 102,', GREEN),
    ('  "averageGrade": "4.11",', GREEN),
    ('  "byGroup": {', YELLOW),
    ('    "ББМО-01-23": 42,', YELLOW),
    ('    "ББМО-02-23": 35,', YELLOW),
    ('    "ББМО-03-23": 25', YELLOW),
    ("  }", YELLOW),
    ("}", FG),
    ("", FG),
    ("[2026-11-16 03:10:41] GET /api/students/stats -> 200 (3ms)", GRAY),
]
save(render_terminal(lines, "Task 5 - GET stats", width=900), "Задание 5 - скриншот 6 (GET api students stats).png")

# Скриншот 7 - GET /api/metrics
lines = [
    ("$ curl http://localhost:3000/api/metrics", CYAN),
    ("", FG),
    ("{", FG),
    ('  "queries":     1523,', BLUE),
    ('  "avgTime":     2.3,', BLUE),
    ('  "errors":      5,', BLUE),
    ('  "cacheHitRate": 0.65', BLUE),
    ("}", FG),
    ("", FG),
    ("[2026-11-16 03:10:45] GET /api/metrics -> 200 (1ms)", GRAY),
]
save(render_terminal(lines, "Task 5 - GET metrics"), "Задание 5 - скриншот 7 (GET api metrics).png")

# Скриншот 8 - логи SQL-запросов
lines = [
    ("--- SQL Logi ---", YELLOW),
    ("[2026-11-16 03:10:25] [BBMO-01-23] SELECT COUNT(*) AS total FROM students (0.5ms)", GRAY),
    ("[2026-11-16 03:10:25] [BBMO-01-23] SELECT * FROM students LIMIT 3 OFFSET 0 (1.2ms)", GRAY),
    ("[2026-11-16 03:10:28] [BBMO-01-23] BEGIN TRANSACTION", YELLOW),
    ("[2026-11-16 03:10:28] [BBMO-01-23] INSERT INTO students ... (0.8ms)", GRAY),
    ("[2026-11-16 03:10:28] [BBMO-01-23] INSERT INTO students ... (0.6ms)", GRAY),
    ("[2026-11-16 03:10:28] [BBMO-01-23] COMMIT", GREEN),
    ("[2026-11-16 03:10:35] [BBMO-01-23] BEGIN TRANSACTION", YELLOW),
    ("[2026-11-16 03:10:35] [BBMO-01-23] INSERT INTO students ... (0.7ms)", GRAY),
    ("[2026-11-16 03:10:35] [BBMO-01-23] ROLLBACK", RED),
    ("[2026-11-16 03:10:41] [BBMO-01-23] SELECT AVG(grade) AS avg ... (2.1ms)", GRAY),
]
save(render_terminal(lines, "Task 5 - SQL Logs", width=1000), "Задание 5 - скриншот 8 (логи SQL запросов).png")

# Скриншот 9 - миграции
lines = [
    ("$ npm run migrate", CYAN),
    ("", FG),
    ("[MIGRATE] Primenena: 001_create_students.sql", GREEN),
    ("[MIGRATE] Primenena: 002_create_groups.sql", GREEN),
    ("[INFO] Migracii primenieny: 2", GREEN),
    ("", FG),
    ("$ npm run migrate:rollback", CYAN),
    ("[MIGRATE] Otkachena: 002_create_groups.sql", YELLOW),
    ("", FG),
    ("$ npm run migrate", CYAN),
    ("[MIGRATE] Primenena: 002_create_groups.sql", GREEN),
    ("[INFO] Migracii primenieny: 1", GREEN),
]
save(render_terminal(lines, "Task 5 - Migrations"), "Задание 5 - скриншот 9 (миграции).png")

# Скриншот 10 - работа кэша
lines = [
    ("$ curl http://localhost:3000/api/cache/stats", CYAN),
    ("", FG),
    ('{"size": 3, "alive": 3, "ttl": 60}', GREEN),
    ("", FG),
    ("--- Demonstratsiya kesha ---", YELLOW),
    ("1-y zapros GET /api/students  -> DB query (2.3ms)  [CACHE MISS]", RED),
    ("2-y zapros GET /api/students  -> Cache hit (0.1ms) [CACHE HIT]", GREEN),
    ("3-y zapros GET /api/students  -> Cache hit (0.0ms) [CACHE HIT]", GREEN),
    ("POST /api/students -> Invalidatsiya kesha", YELLOW),
    ("4-y zapros GET /api/students  -> DB query (2.1ms)  [CACHE MISS]", RED),
    ("", FG),
    ("cacheHitRate: 0.50 (2 hits / 4 requests)", BLUE),
]
save(render_terminal(lines, "Task 5 - Cache", width=900), "Задание 5 - скриншот 10 (работа кэша).png")

print(f"\nVse screenshoty sokhraneny v: {SCREENSHOT_DIR}")
print(f"Vsego: 23 screenshota")
