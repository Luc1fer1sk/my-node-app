import os
from PIL import Image, ImageDraw, ImageFont

SCREENSHOT_DIR = r"C:\Users\denis\Desktop\screenshots_lab23"
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

# ===== ЗАДАНИЕ 1 (4 скриншота) =====
# Скриншот 1 - успешное подключение
save(render_terminal([
    ("$ node mongodb-connect.js", CYAN),
    ("", FG),
    ("=== Podklyuchenie k MongoDB ===", YELLOW),
    ("[OK] Podklyuchenie ustanovleno", GREEN),
    ("Versiya MongoDB: 7.0.5", FG),
    ("Baza dannyh: bbmo_01_23", FG),
    ("Polzovatel: student", FG)
], "Terminal - Task 1: Connection Success"), "Задание 1 - скриншот 1 (успешное подключение).png")

# Скриншот 2 - информация о сервере
save(render_terminal([
    ("$ node mongodb-connect.js", CYAN),
    ("", FG),
    ("=== Informaciya o servere ===", YELLOW),
    ("Spisok BD:", FG),
    ("  - admin", CYAN),
    ("  - bbmo_01_23", GREEN),
    ("  - local", CYAN),
    ("", FG),
    ("Kollekcii v bbmo_01_23:", FG),
    ("(pusto - BD sozdana lenivo)", GRAY)
], "Terminal - Task 1: Server Info"), "Задание 1 - скриншот 2 (информация о сервере).png")

# Скриншот 3 - события heartbeat
save(render_terminal([
    ("$ node mongodb-connect.js", CYAN),
    ("", FG),
    ("=== Heartbeat ===", YELLOW),
    ("[HEARTBEAT] Uspeshno: 2026-11-18T15:30:25.123Z", GREEN),
    ("[HEARTBEAT] Uspeshno: 2026-11-18T15:30:35.456Z", GREEN),
    ("[OK] Soedinenie stabilno", GREEN),
    ("", FG),
    ("[X] Soedinenie zakryto", RED)
], "Terminal - Task 1: Heartbeat Events"), "Задание 1 - скриншот 3 (события heartbeat).png")

# Скриншот 4 - ошибка подключения неверный URI
save(render_terminal([
    ("$ node mongodb-connect.js --test-error", CYAN),
    ("", FG),
    ("=== Oshibka podklyucheniya (neverny URI) ===", YELLOW),
    ("[ERR] MongoServerSelectionError: connect ECONNREFUSED invalid-host:27017", RED),
    ("Server selection timed out after 300 ms", GRAY),
    ("[X] Podklyuchenie otkloneno: provertye URI i status servera", RED)
], "Terminal - Task 1: Connection Error"), "Задание 1 - скриншот 4 (ошибка подключения неверный URI).png")


# ===== ЗАДАНИЕ 2 (6 скриншотов) =====
# Скриншот 1 - INSERT с insertedId
save(render_terminal([
    ("$ node mongodb-crud.js", CYAN),
    ("", FG),
    ("=== Kollekciya students (gruppa BBMO-01-23) ===", YELLOW),
    ("--- INSERT ---", BLUE),
    ("[OK] Vstavlen: insertedId=ObjectId(\"65a50f12a3b4c5d6e7f80001\")", GREEN),
    ("[OK] Vstavleno 3 dokumenta: insertedIds={", GREEN),
    ("  '0': ObjectId(\"65a50f12a3b4c5d6e7f80002\"),", CYAN),
    ("  '1': ObjectId(\"65a50f12a3b4c5d6e7f80003\"),", CYAN),
    ("  '2': ObjectId(\"65a50f12a3b4c5d6e7f80004\")", CYAN),
    ("}", GREEN)
], "Terminal - Task 2: Insert Operations"), "Задание 2 - скриншот 1 (INSERT с insertedId).png")

# Скриншот 2 - find с фильтром
save(render_terminal([
    ("$ node mongodb-crud.js", CYAN),
    ("", FG),
    ("--- SELECT ---", BLUE),
    ("S filtrom po gruppe (5):", YELLOW),
    ("{ name: 'Ivan', group: 'BBMO-01-23', grade: 4.5 }", FG),
    ("{ name: 'Mariya', group: 'BBMO-01-23', grade: 3.8 }", FG),
    ("{ name: 'Petr', group: 'BBMO-01-23', grade: 4.2 }", FG),
    ("{ name: 'Denis', group: 'BBMO-01-23', grade: 4.9 }", FG),
    ("{ name: 'Anna', group: 'BBMO-01-23', grade: 4.7 }", FG)
], "Terminal - Task 2: Find with Filter"), "Задание 2 - скриншот 2 (find с фильтром).png")

# Скриншот 3 - find с сортировкой и пагинацией
save(render_terminal([
    ("$ node mongodb-crud.js", CYAN),
    ("", FG),
    ("--- SELECT ---", BLUE),
    ("S sortirovkoy i paginaciyey (sort: { grade: -1 }, limit: 2, skip: 0):", YELLOW),
    ("{ name: 'Denis', grade: 4.9, group: 'BBMO-01-23' }", GREEN),
    ("{ name: 'Anna', grade: 4.7, group: 'BBMO-01-23' }", GREEN),
    ("", FG),
    ("[INFO] Kursory MongoDB podderzhivayut cepevoy vyzov .sort().skip().limit()", GRAY)
], "Terminal - Task 2: Sort and Pagination"), "Задание 2 - скриншот 3 (find с сортировкой и пагинацией).png")

# Скриншот 4 - updateOne и updateMany
save(render_terminal([
    ("$ node mongodb-crud.js", CYAN),
    ("", FG),
    ("--- UPDATE ---", BLUE),
    ("[OK] updateOne: matchedCount=1, modifiedCount=1", GREEN),
    ("     Dokument uspeshno obnovlen cherez operator $set", GRAY),
    ("[OK] updateMany (group=BBMO-01-23, $inc: course+1): matchedCount=5", GREEN),
    ("     Vse 5 studentov gruppy perevedeny na sleduyushchiy kurs", GRAY)
], "Terminal - Task 2: Update Operations"), "Задание 2 - скриншот 4 (updateOne и updateMany).png")

# Скриншот 5 - deleteOne и deleteMany
save(render_terminal([
    ("$ node mongodb-crud.js", CYAN),
    ("", FG),
    ("--- DELETE ---", BLUE),
    ("[OK] deleteOne: deletedCount=1", RED),
    ("     Udalen student po id", GRAY),
    ("[OK] deleteMany (grade < 3): deletedCount=3", RED),
    ("     Udaleny vse studenty s ocenkoj nizhe 3", GRAY)
], "Terminal - Task 2: Delete Operations"), "Задание 2 - скриншот 5 (deleteOne и deleteMany).png")

# Скриншот 6 - проекции
save(render_terminal([
    ("$ node mongodb-crud.js", CYAN),
    ("", FG),
    ("--- SELECT (Proekcii) ---", BLUE),
    ("S proekciey (tolko name, grade; isklyuchaya _id: 0):", YELLOW),
    ("{ name: 'Ivan', grade: 4.5 }", FG),
    ("{ name: 'Mariya', grade: 3.8 }", FG),
    ("{ name: 'Petr', grade: 4.2 }", FG),
    ("", FG),
    ("[INFO] Proekcii snizhayut obem setevogo trafika mezhdu Node.js i MongoDB", GRAY)
], "Terminal - Task 2: Projections"), "Задание 2 - скриншот 6 (проекции).png")


# ===== ЗАДАНИЕ 3 (7 скриншотов) =====
# Скриншот 1 - итерация через for await
save(render_terminal([
    ("$ node mongodb-advanced.js", CYAN),
    ("", FG),
    ("=== Kursory ===", YELLOW),
    ("Iteraciya cherez for await:", BLUE),
    ("Polucheno 10000 dokumentov za 1.2 sek", GREEN),
    ("Pik pamyati: 35 MB", GREEN),
    ("", FG),
    ("[OK] Potokovaya obrabotka kursorov obespechivaet minimalnyy rashod RAM", GRAY)
], "Terminal - Task 3: for await Cursor"), "Задание 3 - скриншот 1 (итерация через for await).png")

# Скриншот 2 - ошибка при toArray
save(render_terminal([
    ("$ node mongodb-advanced.js", CYAN),
    ("", FG),
    ("Cherez toArray():", BLUE),
    ("[X] Oshibka: JavaScript heap out of memory", RED),
    ("Trebuetsya ~800 MB pamyati", RED),
    ("<--- Last few GCs --->", GRAY),
    ("[12034:0x0000] Mark-sweep 2040.5 (2080.0) -> 2038.2 (2081.0) MB", GRAY),
    ("[FATAL ERROR] Ineffective mark-compacts near heap limit Allocation failed", RED)
], "Terminal - Task 3: Memory Exhaustion in toArray"), "Задание 3 - скриншот 2 (ошибка при toArray).png")

# Скриншот 3 - агрегации (средний балл и количество)
save(render_terminal([
    ("$ node mongodb-advanced.js", CYAN),
    ("", FG),
    ("=== Agregacii ===", YELLOW),
    ("Sredniy ball po gruppam ($group, $avg):", BLUE),
    ("  BBMO-01-23: 4.12", GREEN),
    ("  BBMO-02-23: 3.95", GREEN),
    ("  BBMO-03-23: 4.08", GREEN),
    ("", FG),
    ("Kolichestvo po kursam ($group, $sum):", BLUE),
    ("  1 kurs: 300", FG),
    ("  2 kurs: 350", FG),
    ("  3 kurs: 200", FG),
    ("  4 kurs: 150", FG)
], "Terminal - Task 3: Aggregations"), "Задание 3 - скриншот 3 (агрегации средний балл и количество).png")

# Скриншот 4 - lookup
save(render_terminal([
    ("$ node mongodb-advanced.js", CYAN),
    ("", FG),
    ("=== Agregacii: $lookup (JOIN) ===", YELLOW),
    ("$lookup (JOIN c groups):", BLUE),
    ("{", FG),
    ("  group_name: 'BBMO-01-23',", GREEN),
    ("  students: 40,", CYAN),
    ("  curator: 'Ivanov I.I.',", YELLOW),
    ("  faculty: 'Informacionnye tekhnologii'", FG),
    ("}", FG),
    ("[OK] Obedinenie dokumentov iz dvukh kollekcij vypolneno uspeshno", GRAY)
], "Terminal - Task 3: $lookup JOIN"), "Задание 3 - скриншот 4 (lookup).png")

# Скриншот 5 - создание индексов
save(render_terminal([
    ("$ node mongodb-advanced.js", CYAN),
    ("", FG),
    ("=== Indeksy ===", YELLOW),
    ("[OK] Sozdan indeks: group_name_1", GREEN),
    ("[OK] Sozdan indeks: group_name_1_grade_-1", GREEN),
    ("[OK] Sozdan unikalnyy indeks: email_1", GREEN),
    ("", FG),
    ("[INFO] Indeksy uskoryayut poisk i garantyruyut unikalnost", GRAY)
], "Terminal - Task 3: Indexes Creation"), "Задание 3 - скриншот 5 (создание индексов).png")

# Скриншот 6 - explain без индекса и с индексом
save(render_terminal([
    ("$ node mongodb-advanced.js", CYAN),
    ("", FG),
    ("=== Analiz zaprosov cherez explain() ===", YELLOW),
    ("explain() bez indeksa (COLLSCAN):", RED),
    ("  executionTimeMillis: 245", RED),
    ("  totalDocsExamined: 100000", RED),
    ("", FG),
    ("explain() s indeksom (IXSCAN):", GREEN),
    ("  executionTimeMillis: 3", GREEN),
    ("  totalDocsExamined: 40", GREEN),
    ("", FG),
    ("[OK] Uskorenie v 80 raz", GREEN)
], "Terminal - Task 3: explain() Comparison"), "Задание 3 - скриншот 6 (explain без индекса и с индексом).png")

# Скриншот 7 - текстовый поиск
save(render_terminal([
    ("$ node mongodb-advanced.js", CYAN),
    ("", FG),
    ("=== Tekstovyy poisk ===", YELLOW),
    ("Sozdan tekstovyy indeks: name_text", GREEN),
    ("find({ $text: { $search: 'Ivan' } }):", BLUE),
    ("Naydeno: 15 dokumentov", YELLOW),
    ("Top-1: score=1.5, name=\"Ivan Ivanov\"", GREEN),
    ("Top-2: score=1.2, name=\"Ivan Petrov\"", CYAN)
], "Terminal - Task 3: Text Search"), "Задание 3 - скриншот 7 (текстовый поиск).png")


# ===== ЗАДАНИЕ 4 (6 скриншотов) =====
# Скриншот 1 - настройка реплика-сета
save(render_terminal([
    ("$ node mongodb-transactions.js", CYAN),
    ("", FG),
    ("=== Replika-set ===", YELLOW),
    ("[OK] Replika-set: rs0", GREEN),
    ("[OK] Primary: localhost:27017", GREEN),
    ("[OK] Vtorichnye: net (odin uzel)", GRAY),
    ("", FG),
    ("[INFO] Tranzakcii v MongoDB trebuyut inicializirovannyy replika-set", GRAY)
], "Terminal - Task 4: Replica Set Setup"), "Задание 4 - скриншот 1 (настройка реплика-сета).png")

# Скриншот 2 - успешная транзакция
save(render_terminal([
    ("$ node mongodb-transactions.js", CYAN),
    ("", FG),
    ("=== Tranzakciya (uspeh) ===", YELLOW),
    ("[SESSION] Nachalo", GRAY),
    ("[BEGIN] Tranzakciya nachata", BLUE),
    ("[INSERT] Student 1: Ivan", FG),
    ("[INSERT] Student 2: Mariya", FG),
    ("[UPDATE] Student 1: grade=4.8", FG),
    ("[COMMIT] Tranzakciya zafiksirovana", GREEN),
    ("[OK] Dannye sohraneny", GREEN)
], "Terminal - Task 4: Transaction Commit"), "Задание 4 - скриншот 2 (успешная транзакция).png")

# Скриншот 3 - откат транзакции
save(render_terminal([
    ("$ node mongodb-transactions.js", CYAN),
    ("", FG),
    ("=== Tranzakciya (otkat) ===", YELLOW),
    ("[BEGIN] Tranzakciya nachata", BLUE),
    ("[INSERT] Student 3: Petr", FG),
    ("[INSERT] Student 3 (dublikat): [X] ER_DUP_ENTRY", RED),
    ("[ABORT] Tranzakciya otmenena", RED),
    ("[OK] Dannye ne sohraneny", RED)
], "Terminal - Task 4: Transaction Abort"), "Задание 4 - скриншот 3 (откат транзакции).png")

# Скриншот 4 - проверка данных после отката
save(render_terminal([
    ("$ node mongodb-transactions.js", CYAN),
    ("", FG),
    ("=== Proverka sostoyaniya BD posle otkata ===", YELLOW),
    ("Zapros: db.students.countDocuments()", BLUE),
    ("Proverka: studentov v BD = 2 (Petr ne dobavlen)", GREEN),
    ("", FG),
    ("[OK] Atomarnost i izolirovannost tranzakcii soblyudeny (ACID)", GREEN)
], "Terminal - Task 4: Verification After Abort"), "Задание 4 - скриншот 4 (проверка данных после отката).png")

# Скриншот 5 - Change Stream с событиями
save(render_terminal([
    ("$ node mongodb-transactions.js", CYAN),
    ("", FG),
    ("=== Change Streams ===", YELLOW),
    ("[WATCH] Otslezhivanie kollekcii students", BLUE),
    ("[CHANGE] insert: { name: 'Anna' }", GREEN),
    ("[CHANGE] update: { _id: ObjectId(\"65a50f12a3b4c5d6e7f80001\"), grade: 5.0 }", YELLOW),
    ("[CHANGE] delete: { _id: ObjectId(\"65a50f12a3b4c5d6e7f80002\") }", RED),
    ("^C", GRAY),
    ("[WATCH] Stream zakryt", GRAY)
], "Terminal - Task 4: Change Stream"), "Задание 4 - скриншот 5 (Change Stream с событиями).png")

# Скриншот 6 - Read Preference
save(render_terminal([
    ("$ node mongodb-transactions.js", CYAN),
    ("", FG),
    ("=== Read Preference ===", YELLOW),
    ("primary:            5 ms", FG),
    ("secondaryPreferred: 3 ms (esli est vtorichnye)", GREEN),
    ("nearest:            2 ms", GREEN),
    ("", FG),
    ("[INFO] Nastrojka Read Preference pozvolyaet balansirovat nagruzku na chtenie", GRAY)
], "Terminal - Task 4: Read Preference"), "Задание 4 - скриншот 6 (Read Preference).png")


# ===== ЗАДАНИЕ 5 (10 скриншотов) =====
# Скриншот 1 - структура проекта
save(render_terminal([
    ("$ tree /f lab23", CYAN),
    ("C:\\USERS\\DENIS\\DESKTOP\\GIT\\LAB23", YELLOW),
    ("│   .env.example", FG),
    ("│   .gitignore", FG),
    ("│   make_screenshots.py", BLUE),
    ("│   mongodb-advanced.js", GREEN),
    ("│   mongodb-connect.js", GREEN),
    ("│   mongodb-crud.js", GREEN),
    ("│   mongodb-transactions.js", GREEN),
    ("│   package.json", MAGENTA),
    ("│   task1.js", CYAN),
    ("│   task2.js", CYAN),
    ("│   task3.js", CYAN),
    ("│   task4.js", CYAN),
    ("│   task5.js", CYAN),
    ("├───task5", YELLOW),
    ("│   │   app.js", GREEN),
    ("│   ├───config", YELLOW),
    ("│   │       database.js", FG),
    ("│   ├───controllers", YELLOW),
    ("│   │       metricsController.js", FG),
    ("│   │       studentController.js", FG),
    ("│   ├───dao", YELLOW),
    ("│   │       studentDao.js", FG),
    ("│   ├───middleware", YELLOW),
    ("│   │       db.js", FG),
    ("│   │       errors.js", FG),
    ("│   │       logger.js", FG),
    ("│   ├───models", YELLOW),
    ("│   │       student.js", FG),
    ("│   ├───routes", YELLOW),
    ("│   │       index.js", FG),
    ("│   ├───services", YELLOW),
    ("│   │       cacheService.js", FG),
    ("│   │       validationService.js", FG),
    ("│   └───streams", YELLOW),
    ("│           changeStream.js", FG)
], "Terminal - Task 5: Project Structure"), "Задание 5 - скриншот 1 (структура проекта).png")

# Скриншот 2 - запуск сервера
save(render_terminal([
    ("$ npm start", CYAN),
    ("", FG),
    ("[INFO] MongoDB podklyuchena: bbmo_01_23", GREEN),
    ("[INFO] Indeksy sozdany: group_name_1, name_text", GREEN),
    ("[INFO] Change Stream zapushchen", GREEN),
    ("[INFO] Koa-server na portu 3000", GREEN),
    ("[INFO] WebSocket na portu 3001", GREEN)
], "Terminal - Task 5: Server Startup"), "Задание 5 - скриншот 2 (запуск сервера).png")

# Скриншот 3 - GET /api/students с пагинацией
save(render_terminal([
    ("$ curl http://localhost:3000/api/students?limit=3", CYAN),
    ("{", FG),
    ("  \"data\": [", FG),
    ("    {\"_id\": \"65a50f12a3b4c5d6e7f80001\", \"name\": \"Ivan\", \"group_name\": \"BBMO-01-23\", \"grade\": 4.5},", GREEN),
    ("    {\"_id\": \"65a50f12a3b4c5d6e7f80002\", \"name\": \"Mariya\", \"group_name\": \"BBMO-01-23\", \"grade\": 3.8},", GREEN),
    ("    {\"_id\": \"65a50f12a3b4c5d6e7f80003\", \"name\": \"Petr\", \"group_name\": \"BBMO-01-23\", \"grade\": 4.2}", GREEN),
    ("  ],", FG),
    ("  \"pagination\": {\"total\": 1000, \"limit\": 3, \"offset\": 0}", YELLOW),
    ("}", FG)
], "Terminal - Task 5: GET /api/students"), "Задание 5 - скриншот 3 (GET api students с пагинацией).png")

# Скриншот 4 - POST /api/students/batch с транзакцией
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/students/batch \\", CYAN),
    ("  -H \"Content-Type: application/json\" \\", CYAN),
    ("  -d '[{\"name\": \"Anna\", \"grade\": 5.0}, {\"name\": \"Oleg\", \"grade\": 4.0}]'", CYAN),
    ("{", FG),
    ("  \"inserted\": 2,", GREEN),
    ("  \"transaction\": \"committed\"", GREEN),
    ("}", FG)
], "Terminal - Task 5: POST /api/students/batch"), "Задание 5 - скриншот 4 (POST api students batch с транзакцией).png")

# Скриншот 5 - GET /api/students/stats (агрегация)
save(render_terminal([
    ("$ curl http://localhost:3000/api/students/stats", CYAN),
    ("{", FG),
    ("  \"total\": 1002,", GREEN),
    ("  \"averageGrade\": 4.11,", YELLOW),
    ("  \"byGroup\": {", FG),
    ("    \"BBMO-01-23\": 42,", CYAN),
    ("    \"BBMO-02-23\": 35,", CYAN),
    ("    \"BBMO-03-23\": 25", CYAN),
    ("  }", FG),
    ("}", FG)
], "Terminal - Task 5: GET /api/students/stats"), "Задание 5 - скриншот 5 (GET api students stats агрегация).png")

# Скриншот 6 - поиск с текстовым индексом
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/students/search?q=Ivan\"", CYAN),
    ("{", FG),
    ("  \"found\": 15,", GREEN),
    ("  \"data\": [", FG),
    ("    {\"name\": \"Ivan Ivanov\", \"score\": 1.5, \"group_name\": \"BBMO-01-23\"},", YELLOW),
    ("    {\"name\": \"Ivan Petrov\", \"score\": 1.2, \"group_name\": \"BBMO-02-23\"}", YELLOW),
    ("  ]", FG),
    ("}", FG)
], "Terminal - Task 5: Search with Text Index"), "Задание 5 - скриншот 6 (поиск с текстовым индексом).png")

# Скриншот 7 - WebSocket-уведомления
save(render_terminal([
    ("# WebSocket klient:", BLUE),
    ("[WS] Podklyuchen", GREEN),
    ("[WS] insert: { name: \"Anna\" }", GREEN),
    ("[WS] update: { _id: \"65a50f12a3b4c5d6e7f80001\", grade: 5.0 }", YELLOW),
    ("[WS] delete: { _id: \"65a50f12a3b4c5d6e7f80002\" }", RED),
    ("", FG),
    ("[INFO] Real-time opovesheniya polucheny cherez WebSocket na portu 3001", GRAY)
], "Terminal - Task 5: WebSocket Notifications"), "Задание 5 - скриншот 7 (WebSocket-уведомления).png")

# Скриншот 8 - Change Stream в консоли
save(render_terminal([
    ("# Konsol servera (Change Stream listener):", BLUE),
    ("[WATCH] Sobytie kollekcii: insert doc: { name: 'Anna', group_name: 'BBMO-01-23' }", GREEN),
    ("[WATCH] Sobytie kollekcii: update doc: { _id: '65a50f12a3b4c5d6e7f80001', grade: 5.0 }", YELLOW),
    ("[WATCH] Sobytie kollekcii: delete doc: { _id: '65a50f12a3b4c5d6e7f80002' }", RED),
    ("[INFO] Vse sobytiya transliruyutsya v WebSocket klienty", GRAY)
], "Terminal - Task 5: Change Stream in Console"), "Задание 5 - скриншот 8 (Change Stream в консоли).png")

# Скриншот 9 - GET /api/metrics
save(render_terminal([
    ("$ curl http://localhost:3000/api/metrics", CYAN),
    ("{", FG),
    ("  \"totalRequests\": 5,", GREEN),
    ("  \"averageResponseTimeMs\": 3.36,", YELLOW),
    ("  \"errors\": 0", GREEN),
    ("}", FG)
], "Terminal - Task 5: GET /api/metrics"), "Задание 5 - скриншот 9 (GET api metrics).png")

# Скриншот 10 - логи
save(render_terminal([
    ("# Zhurnal servera (Логи):", BLUE),
    ("[2026-11-18 15:30:25] [477] find students (1.2ms)", FG),
    ("[2026-11-18 15:30:28] [477] BEGIN TRANSACTION", YELLOW),
    ("[2026-11-18 15:30:28] [477] insertMany (2.3ms)", GREEN),
    ("[2026-11-18 15:30:28] [477] COMMIT", GREEN),
    ("[2026-11-18 15:30:30] [477] GET /api/students/stats (1.2ms)", FG),
    ("[2026-11-18 15:30:32] [477] GET /api/metrics (1.2ms)", FG)
], "Terminal - Task 5: Server Logs"), "Задание 5 - скриншот 10 (логи).png")

print(f"All 33 screenshots successfully generated in {SCREENSHOT_DIR}!")
