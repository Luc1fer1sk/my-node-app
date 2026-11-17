require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'student',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bbmo_01_23',
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
    waitForConnections: true,
    queueLimit: 0,
  },
  port: parseInt(process.env.PORT) || 3000,
};
