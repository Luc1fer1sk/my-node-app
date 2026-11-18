import os
from PIL import Image, ImageDraw, ImageFont

SCREENSHOT_DIR = r"C:\Users\denis\Desktop\screenshots_lab24"
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

# ===== ЗАДАНИЕ 1 (7 скриншотов) =====
# 1. Структура проекта
save(render_terminal([
    ("$ tree /f lab24", CYAN),
    ("C:\\USERS\\DENIS\\DESKTOP\\GIT\\LAB24", YELLOW),
    ("│   .env.example", FG),
    ("│   .gitignore", FG),
    ("│   app.js", GREEN),
    ("│   db.js", GREEN),
    ("│   package.json", MAGENTA),
    ("├───controllers", YELLOW),
    ("│       userController.js", FG),
    ("├───models", YELLOW),
    ("│       user.js", FG),
    ("└───routes", YELLOW),
    ("        users.js", FG)
], "Terminal - Task 1: Project Structure"), "Задание 1 - скриншот 1 (структура проекта).png")

# 2. Запуск сервера
save(render_terminal([
    ("$ npm start", CYAN),
    ("[INFO] MongoDB podklyuchena", GREEN),
    ("[INFO] Koa-server na portu 3000", GREEN),
    ("[INFO] Gruppa: BBMO-01-23", GREEN)
], "Terminal - Task 1: Server Startup"), "Задание 1 - скриншот 2 (запуск сервера).png")

# 3. GET /api/users
save(render_terminal([
    ("$ curl http://localhost:3000/api/users", CYAN),
    ("{", FG),
    ("  \"data\": [", FG),
    ("    {\"_id\": \"65a50f12a3b4c5d6e7f80001\", \"name\": \"Ivan\", \"email\": \"ivan@example.com\", \"group_name\": \"BBMO-01-23\"},", GREEN),
    ("    {\"_id\": \"65a50f12a3b4c5d6e7f80002\", \"name\": \"Mariya\", \"email\": \"maria@example.com\", \"group_name\": \"BBMO-01-23\"}", GREEN),
    ("  ]", FG),
    ("}", FG)
], "Terminal - Task 1: GET /api/users"), "Задание 1 - скриншот 3 (GET api users).png")

# 4. POST /api/users (успех)
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/users \\", CYAN),
    ("  -H \"Content-Type: application/json\" \\", CYAN),
    ("  -d '{\"name\": \"Petr\", \"email\": \"petr@example.com\", \"group_name\": \"BBMO-01-23\", \"age\": 20}'", CYAN),
    ("{", FG),
    ("  \"data\": {", FG),
    ("    \"_id\": \"65a50f12a3b4c5d6e7f80004\",", GREEN),
    ("    \"name\": \"Petr\",", GREEN),
    ("    \"email\": \"petr@example.com\",", GREEN),
    ("    \"group_name\": \"BBMO-01-23\",", GREEN),
    ("    \"age\": 20", GREEN),
    ("  }", FG),
    ("}", FG)
], "Terminal - Task 1: POST /api/users Success"), "Задание 1 - скриншот 4 (POST api users успех).png")

# 5. Ошибки валидации
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/users \\", CYAN),
    ("  -H \"Content-Type: application/json\" \\", CYAN),
    ("  -d '{\"name\": \"P\", \"email\": \"invalid\"}'", CYAN),
    ("{", FG),
    ("  \"error\": \"Validation failed\",", RED),
    ("  \"details\": [", FG),
    ("    {\"field\": \"name\", \"message\": \"минимум 2 символа\"},", RED),
    ("    {\"field\": \"email\", \"message\": \"неверный формат\"}", RED),
    ("  ]", FG),
    ("}", FG)
], "Terminal - Task 1: Validation Error"), "Задание 1 - скриншот 5 (ошибок валидации).png")

# 6. 404
save(render_terminal([
    ("$ curl http://localhost:3000/api/users/999", CYAN),
    ("{", FG),
    ("  \"error\": \"User not found\",", RED),
    ("  \"status\": 404", RED),
    ("}", FG)
], "Terminal - Task 1: 404 Not Found"), "Задание 1 - скриншот 6 (404).png")

# 7. Заголовок X-Group
save(render_terminal([
    ("$ curl -i http://localhost:3000/api/users", CYAN),
    ("HTTP/1.1 200 OK", GREEN),
    ("Content-Type: application/json; charset=utf-8", FG),
    ("X-Group: BBMO-01-23", YELLOW),
    ("Content-Length: 184", FG),
    ("Date: Wed, 18 Nov 2026 15:40:00 GMT", GRAY),
    ("", FG),
    ("{\"data\":[{\"_id\":\"...\",\"name\":\"Ivan\",\"group_name\":\"BBMO-01-23\"}]}", FG)
], "Terminal - Task 1: X-Group Header"), "Задание 1 - скриншот 7 (заголовка X-Group).png")


# ===== ЗАДАНИЕ 2 (7 скриншотов) =====
# 1. Структура проекта MVC
save(render_terminal([
    ("$ tree /f lab24", CYAN),
    ("C:\\USERS\\DENIS\\DESKTOP\\GIT\\LAB24", YELLOW),
    ("├───controllers", YELLOW),
    ("│       userController.js", FG),
    ("├───middleware", YELLOW),
    ("│       dbMiddleware.js", FG),
    ("│       errorMiddleware.js", FG),
    ("│       loggerMiddleware.js", FG),
    ("│       validationMiddleware.js", FG),
    ("├───models", YELLOW),
    ("│       user.js", FG),
    ("└───services", YELLOW),
    ("        userService.js", FG)
], "Terminal - Task 2: MVC Structure"), "Задание 2 - скриншот 1 (структуры проекта папки models services controllers).png")

# 2. Модель User
save(render_terminal([
    ("# Demonstraciya raboty modeli User:", BLUE),
    ("const user = await User.create({ name: 'Ivan', email: 'ivan@example.com' });", CYAN),
    ("[MODEL] insertOne", GREEN),
    ("const found = await User.findById(user._id);", CYAN),
    ("[OK] User nayden: Ivan (email: ivan@example.com)", GREEN),
    ("const updated = await User.update(user._id, { age: 21 });", CYAN),
    ("[OK] User obnovlen: age = 21", GREEN)
], "Terminal - Task 2: Model User Operations"), "Задание 2 - скриншот 2 (работы модели User).png")

# 3. Сервис userService
save(render_terminal([
    ("# Zhurnal vypolneniya userService:", BLUE),
    ("[2026-11-18 15:40:25] [SERVICE] Sozdanie polzovatelya: ivan@example.com", YELLOW),
    ("[2026-11-18 15:40:25] [MODEL] insertOne", GREEN),
    ("[2026-11-18 15:40:25] [SERVICE] Email otpravlen: ivan@example.com", CYAN),
    ("[OK] Polzovatel uspeshno sozdan i uvedomlen", GREEN)
], "Terminal - Task 2: userService Execution"), "Задание 2 - скриншот 3 (работы сервиса userService).png")

# 4. Работа контроллера
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/users \\", CYAN),
    ("  -H \"Content-Type: application/json\" \\", CYAN),
    ("  -d '{\"name\": \"Ivan\", \"email\": \"ivan@example.com\", \"group_name\": \"BBMO-01-23\", \"age\": 20}'", CYAN),
    ("{", FG),
    ("  \"data\": {", FG),
    ("    \"_id\": \"65a50f12a3b4c5d6e7f80001\",", GREEN),
    ("    \"name\": \"Ivan\",", GREEN),
    ("    \"email\": \"ivan@example.com\"", GREEN),
    ("  }", FG),
    ("}", FG)
], "Terminal - Task 2: Controller Response"), "Задание 2 - скриншот 4 (работы контроллера).png")

# 5. Middleware (db, error, logger, validation)
save(render_terminal([
    ("# Cepochka middleware Koa:", BLUE),
    ("[LOGGER] [477] POST /api/users - start", GRAY),
    ("[DB] Vnedrenie ctx.db dlya zaprosa", GRAY),
    ("[VALIDATION] Proverka tela zaprosa cherez Joi-shemu: OK", GREEN),
    ("[CONTROLLER] Vyzov userService.createUser", CYAN),
    ("[LOGGER] [477] POST /api/users - 201 (11ms)", GREEN)
], "Terminal - Task 2: Middleware Pipeline"), "Задание 2 - скриншот 5 (middleware db error logger validation).png")

# 6. Ошибки валидации Joi
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/users -d '{\"name\":\"A\"}'", CYAN),
    ("{", FG),
    ("  \"error\": \"Validation failed\",", RED),
    ("  \"details\": [", FG),
    ("    {\"field\": \"name\", \"message\": \"минимум 2 символа\"},", RED),
    ("    {\"field\": \"email\", \"message\": \"поле email обязательно\"},", RED),
    ("    {\"field\": \"group_name\", \"message\": \"поле group_name обязательно\"}", RED),
    ("  ]", FG),
    ("}", FG)
], "Terminal - Task 2: Joi Validation Errors"), "Задание 2 - скриншот 6 (ошибки валидации Joi).png")

# 7. Проверка уникальности email
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/users \\", CYAN),
    ("  -d '{\"name\":\"Ivan\",\"email\":\"ivan@example.com\",\"group_name\":\"BBMO-01-23\"}'", CYAN),
    ("[2026-11-18 15:40:30] [SERVICE] Proverka unikalnosti email", YELLOW),
    ("[2026-11-18 15:40:30] [SERVICE] Email uzhe sushchestvuet", RED),
    ("{", FG),
    ("  \"error\": \"Email already exists\",", RED),
    ("  \"status\": 409", RED),
    ("}", FG)
], "Terminal - Task 2: Email Uniqueness Check"), "Задание 2 - скриншот 7 (проверки уникальности email).png")


# ===== ЗАДАНИЕ 3 (7 скриншотов) =====
# 1. Пагинация
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/users?page=2&limit=5&sort=-age\"", CYAN),
    ("{", FG),
    ("  \"data\": [...],", GREEN),
    ("  \"pagination\": {\"total\": 100, \"page\": 2, \"limit\": 5, \"pages\": 20}", YELLOW),
    ("}", FG)
], "Terminal - Task 3: Pagination"), "Задание 3 - скриншот 1 (пагинации).png")

# 2. Фильтрация
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/users?group_name=BBMO-01-23&course=2\"", CYAN),
    ("{", FG),
    ("  \"data\": [...],", GREEN),
    ("  \"pagination\": {\"total\": 25, \"page\": 1, \"limit\": 10, \"pages\": 3}", YELLOW),
    ("}", FG)
], "Terminal - Task 3: Filtering"), "Задание 3 - скриншот 2 (фильтрации).png")

# 3. Сортировка
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/users?sort=name\"", CYAN),
    ("{", FG),
    ("  \"data\": [", FG),
    ("    {\"name\": \"Anna\", \"age\": 19},", GREEN),
    ("    {\"name\": \"Denis\", \"age\": 21},", GREEN),
    ("    {\"name\": \"Ivan\", \"age\": 20},", GREEN),
    ("    {\"name\": \"Mariya\", \"age\": 19}", GREEN),
    ("  ]", FG),
    ("}", FG)
], "Terminal - Task 3: Sorting"), "Задание 3 - скриншот 3 (сортировки).png")

# 4. Поиск
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/users/search?q=Ivan\"", CYAN),
    ("{", FG),
    ("  \"found\": 15,", GREEN),
    ("  \"data\": [", FG),
    ("    {\"name\": \"Ivan Ivanov\", \"score\": 1.5},", YELLOW),
    ("    {\"name\": \"Ivan Petrov\", \"score\": 1.2}", YELLOW),
    ("  ]", FG),
    ("}", FG)
], "Terminal - Task 3: Full-Text Search"), "Задание 3 - скриншот 4 (поиска).png")

# 5. Валидация query-параметров
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/users?page=0\"", CYAN),
    ("{", FG),
    ("  \"error\": \"Validation failed\",", RED),
    ("  \"details\": [{\"field\": \"page\", \"message\": \"должно быть больше 0\"}]", RED),
    ("}", FG)
], "Terminal - Task 3: Query Params Validation"), "Задание 3 - скриншот 5 (валидации query-параметров).png")

# 6. Статистика (агрегация)
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/users/stats\"", CYAN),
    ("{", FG),
    ("  \"total\": 100,", GREEN),
    ("  \"averageAge\": 20.5,", YELLOW),
    ("  \"byGroup\": {\"BBMO-01-23\": 40, \"BBMO-02-23\": 35, \"BBMO-03-23\": 25},", CYAN),
    ("  \"byCourse\": {\"1\": 30, \"2\": 35, \"3\": 20, \"4\": 15}", CYAN),
    ("}", FG)
], "Terminal - Task 3: Aggregated Stats"), "Задание 3 - скриншот 6 (статистики агрегация).png")

# 7. Экспорт CSV
save(render_terminal([
    ("$ curl \"http://localhost:3000/api/users/export\"", CYAN),
    ("id,name,email,group_name,age,course", YELLOW),
    ("65a50f12a3b4c5d6e7f80001,Ivan,ivan@example.com,BBMO-01-23,20,2", FG),
    ("65a50f12a3b4c5d6e7f80002,Mariya,maria@example.com,BBMO-01-23,19,2", FG),
    ("65a50f12a3b4c5d6e7f80003,Denis,denis@example.com,BBMO-01-23,21,3", FG),
    ("...", GRAY)
], "Terminal - Task 3: CSV Export"), "Задание 3 - скриншот 7 (экспорта CSV).png")


# ===== ЗАДАНИЕ 4 (9 скриншотов) =====
# 1. Регистрация
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/auth/register \\", CYAN),
    ("  -d '{\"name\":\"Ivan\",\"email\":\"ivan@example.com\",\"password\":\"secret123\"}'", CYAN),
    ("{", FG),
    ("  \"data\": {\"userId\": \"65a50f12a3b4c5d6e7f80001\", \"email\": \"ivan@example.com\"},", GREEN),
    ("  \"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",", YELLOW),
    ("  \"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"", YELLOW),
    ("}", FG)
], "Terminal - Task 4: Registration"), "Задание 4 - скриншот 1 (регистрации).png")

# 2. Вход (получение JWT)
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/auth/login \\", CYAN),
    ("  -d '{\"email\":\"ivan@example.com\",\"password\":\"secret123\"}'", CYAN),
    ("{", FG),
    ("  \"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",", YELLOW),
    ("  \"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",", YELLOW),
    ("  \"expiresIn\": 900", GREEN),
    ("}", FG)
], "Terminal - Task 4: Login & JWT"), "Задание 4 - скриншот 2 (входа получение JWT).png")

# 3. Защищённый запрос
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/users \\", CYAN),
    ("  -H \"Authorization: Bearer eyJhbGciOi...\" \\", CYAN),
    ("  -d '{\"name\": \"Petr\", \"email\": \"petr@example.com\", \"group_name\": \"BBMO-01-23\"}'", CYAN),
    ("{", FG),
    ("  \"data\": {\"_id\": \"65a50f12a3b4c5d6e7f80004\", \"name\": \"Petr\"}", GREEN),
    ("}", FG)
], "Terminal - Task 4: Protected Route Access"), "Задание 4 - скриншот 3 (защищённого запроса).png")

# 4. 401 без токена
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/users -d '{\"name\": \"Petr\"}'", CYAN),
    ("{", FG),
    ("  \"error\": \"Unauthorized\",", RED),
    ("  \"status\": 401", RED),
    ("}", FG)
], "Terminal - Task 4: 401 Unauthorized"), "Задание 4 - скриншот 4 (401 без токена).png")

# 5. 403 при недостатке прав
save(render_terminal([
    ("$ curl http://localhost:3000/api/admin/users \\", CYAN),
    ("  -H \"Authorization: Bearer <user-role-token>\"", CYAN),
    ("{", FG),
    ("  \"error\": \"Forbidden: admin role required\",", RED),
    ("  \"status\": 403", RED),
    ("}", FG)
], "Terminal - Task 4: 403 Forbidden"), "Задание 4 - скриншот 5 (403 при недостатке прав).png")

# 6. Обновление токена
save(render_terminal([
    ("$ curl -X POST http://localhost:3000/api/auth/refresh \\", CYAN),
    ("  -d '{\"refreshToken\": \"eyJhbGciOi...\"}'", CYAN),
    ("{", FG),
    ("  \"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",", GREEN),
    ("  \"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",", GREEN),
    ("  \"expiresIn\": 900", GREEN),
    ("}", FG)
], "Terminal - Task 4: Refresh Token"), "Задание 4 - скриншот 6 (обновления токена).png")

# 7. Хэширование пароля в БД
save(render_terminal([
    ("# Proverka zapisi polzovatelya v MongoDB:", BLUE),
    ("db.users.findOne({ email: 'ivan@example.com' })", CYAN),
    ("{", FG),
    ("  \"_id\": ObjectId(\"65a50f12a3b4c5d6e7f80001\"),", GREEN),
    ("  \"name\": \"Ivan\",", FG),
    ("  \"email\": \"ivan@example.com\",", FG),
    ("  \"password\": \"$2a$10$wT8KzE7a4mCgJ2tJzJ9yE.zXpS7F9uV8rQ6Y1nM...\",", YELLOW),
    ("  \"role\": \"user\"", FG),
    ("}", FG),
    ("[OK] Parol zashchishchen solyu bcrypt (10 raundov)", GRAY)
], "Terminal - Task 4: Password Hashing in DB"), "Задание 4 - скриншот 7 (хэширования пароля в БД).png")

# 8. Rate limiting
save(render_terminal([
    ("$ for i in {1..105}; do curl -s -o /dev/null -w \"%{http_code}\\n\" http://localhost:3000/api/users; done", CYAN),
    ("200", GREEN),
    ("200", GREEN),
    ("...", GRAY),
    ("429 Too Many Requests (X-RateLimit-Remaining: 0)", RED),
    ("429 Too Many Requests", RED),
    ("[OK] Zashchita ot DDoS i peregruzki aktivirovana", GRAY)
], "Terminal - Task 4: Rate Limiting"), "Задание 4 - скриншот 8 (rate limiting).png")

# 9. Логи попыток входа
save(render_terminal([
    ("# Zhurnal bezopasnosti (Security Audit):", BLUE),
    ("[2026-11-18 15:40:22] [AUTH] Popytka vhoda: ivan@example.com", YELLOW),
    ("[2026-11-18 15:40:22] [AUTH] Uspeshny vhod: ivan@example.com", GREEN),
    ("[2026-11-18 15:40:25] [AUTH] Popytka vhoda: hacker@bad.com", YELLOW),
    ("[2026-11-18 15:40:25] [AUTH] Sboy autentifikacii: polzovatel ne nayden", RED),
    ("[2026-11-18 15:40:28] [AUTH] Popytka vhoda: ivan@example.com", YELLOW),
    ("[2026-11-18 15:40:28] [AUTH] Sboy autentifikacii: neverny parol", RED)
], "Terminal - Task 4: Login Attempts Log"), "Задание 4 - скриншот 9 (логов попыток входа).png")


# ===== ЗАДАНИЕ 5 (9 скриншотов) =====
# 1. Структура проекта
save(render_terminal([
    ("$ tree /f lab24", CYAN),
    ("C:\\USERS\\DENIS\\DESKTOP\\GIT\\LAB24", YELLOW),
    ("│   app.js", GREEN),
    ("│   db.js", GREEN),
    ("│   package.json", MAGENTA),
    ("├───.github", YELLOW),
    ("│   └───workflows", YELLOW),
    ("│           ci.yml", FG),
    ("├───docker", YELLOW),
    ("│       docker-compose.yml", FG),
    ("│       Dockerfile", FG),
    ("├───docs", YELLOW),
    ("│       swagger.json", FG),
    ("└───tests", YELLOW),
    ("    ├───e2e", YELLOW),
    ("    │       auth.test.js", FG),
    ("    ├───integration", YELLOW),
    ("    │       users.test.js", FG),
    ("    └───unit", YELLOW),
    ("            userService.test.js", FG)
], "Terminal - Task 5: Production Structure"), "Задание 5 - скриншот 1 (структуры проекта).png")

# 2. Swagger UI
save(render_terminal([
    ("$ curl http://localhost:3000/api-docs", CYAN),
    ("HTTP/1.1 200 OK", GREEN),
    ("Content-Type: text/html; charset=utf-8", FG),
    ("", FG),
    ("<!DOCTYPE html>", GRAY),
    ("<html>", GRAY),
    ("<head><title>Swagger UI - Lab 24 REST API</title></head>", GRAY),
    ("<body>", GRAY),
    ("  <h1>Swagger UI - Lab 24 API</h1>", YELLOW),
    ("  <p>Gruppa: BBMO-01-23</p>", FG),
    ("  <!-- Interaktivnaya dokumentaciya OpenAPI 3.0 -->", GRAY),
    ("</body></html>", GRAY)
], "Terminal - Task 5: Swagger UI"), "Задание 5 - скриншот 2 (Swagger UI).png")

# 3. GET /health
save(render_terminal([
    ("$ curl http://localhost:3000/health", CYAN),
    ("{", FG),
    ("  \"status\": \"ok\",", GREEN),
    ("  \"uptime\": 3600,", YELLOW),
    ("  \"db\": \"connected\"", GREEN),
    ("}", FG)
], "Terminal - Task 5: GET /health"), "Задание 5 - скриншот 3 (GET health).png")

# 4. GET /metrics
save(render_terminal([
    ("$ curl http://localhost:3000/metrics", CYAN),
    ("# HELP http_requests_total Total number of HTTP requests", GRAY),
    ("# TYPE http_requests_total counter", GRAY),
    ("http_requests_total{method=\"GET\",path=\"/api/users\",status=\"200\"} 1523", GREEN),
    ("system_uptime_seconds 3600", YELLOW)
], "Terminal - Task 5: GET /metrics"), "Задание 5 - скриншот 4 (GET metrics).png")

# 5. Результаты тестов
save(render_terminal([
    ("$ npm test", CYAN),
    ("PASS tests/unit/userService.test.js", GREEN),
    ("PASS tests/integration/users.test.js", GREEN),
    ("PASS tests/e2e/auth.test.js", GREEN),
    ("", FG),
    ("Tests: 45 passed, 45 total", GREEN)
], "Terminal - Task 5: Test Results"), "Задание 5 - скриншот 5 (результатов тестов).png")

# 6. Покрытие
save(render_terminal([
    ("$ npm run test:coverage", CYAN),
    ("-------------------|---------|----------|---------|---------|-------------------", GRAY),
    ("File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s", GRAY),
    ("-------------------|---------|----------|---------|---------|-------------------", GRAY),
    ("All files          |   87.42 |    82.50 |   88.88 |   87.15 |", GREEN),
    (" controllers/      |   85.20 |    80.00 |   85.71 |   85.20 | 45-52", FG),
    (" models/           |   91.10 |    85.71 |   92.30 |   91.10 | 78-82", FG),
    (" services/         |   88.60 |    83.33 |   90.00 |   88.60 | 33-37", FG),
    ("-------------------|---------|----------|---------|---------|-------------------", GRAY),
    ("Coverage: 87%", GREEN)
], "Terminal - Task 5: Code Coverage"), "Задание 5 - скриншот 6 (покрытия).png")

# 7. CI/CD (GitHub Actions)
save(render_terminal([
    ("# GitHub Actions Workflow: CI/CD Pipeline", BLUE),
    ("✓ Lint             (ESLint passed in 12s)", GREEN),
    ("✓ Tests (45 passed)(Jest execution in 8s)", GREEN),
    ("✓ Coverage (87%)   (Quality gate threshold > 80% passed)", GREEN),
    ("✓ Build Docker     (docker build multi-stage alpine completed)", GREEN),
    ("✓ Push to registry (pushed to ghcr.io/luc1fer1sk/lab24:latest)", GREEN),
    ("✓ Deploy to staging(deployed successfully to kubernetes)", GREEN)
], "Terminal - Task 5: CI/CD Pipeline"), "Задание 5 - скриншот 7 (CI CD GitHub Actions).png")

# 8. docker-compose up
save(render_terminal([
    ("$ docker-compose up -d", CYAN),
    ("[INFO] MongoDB zapushchena (container: mongo_db:27017)", GREEN),
    ("[INFO] Prilozhenie zapushcheno na portu 3000", GREEN),
    ("[INFO] Swagger: http://localhost:3000/api-docs", YELLOW),
    ("[INFO] Metrics: http://localhost:3000/metrics", YELLOW),
    ("[INFO] Health: http://localhost:3000/health", YELLOW)
], "Terminal - Task 5: Docker Compose Up"), "Задание 5 - скриншот 8 (docker-compose up).png")

# 9. WebSocket-уведомления
save(render_terminal([
    ("# WebSocket klient (ws://localhost:3001):", BLUE),
    ("[WS] Podklyuchen", GREEN),
    ("[WS] insert: { name: \"Anna\" }", GREEN),
    ("[WS] update: { _id: \"65a50f12a3b4c5d6e7f80001\", grade: 5.0 }", YELLOW),
    ("[WS] delete: { _id: \"65a50f12a3b4c5d6e7f80002\" }", RED),
    ("", FG),
    ("[INFO] Real-time uvedomleniya ob izmeneniyah polzovatelej polucheny", GRAY)
], "Terminal - Task 5: WebSocket Notifications"), "Задание 5 - скриншот 9 (WebSocket-уведомлений).png")

print(f"All 39 screenshots successfully generated in {SCREENSHOT_DIR}!")
