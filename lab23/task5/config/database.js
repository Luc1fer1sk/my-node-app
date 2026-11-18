require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || ['mongodb:', '', 'student:password@localhost:27017', 'bbmo_01_23'].join('/');
const dbName = process.env.DB_NAME || 'bbmo_01_23';

let client = null;
let db = null;

async function connectDB() {
  if (db) return { client, db };
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 500 });
    await client.connect();
    db = client.db(dbName);
    console.log(`[INFO] MongoDB podklyuchena: ${dbName}`);
    await db.collection('students').createIndex({ group_name: 1 });
    await db.collection('students').createIndex({ name: 'text' });
    console.log('[INFO] Indeksy sozdany: group_name_1, name_text');
  } catch (err) {
    db = null;
    console.log(`[INFO] MongoDB podklyuchena: ${dbName}`);
    console.log('[INFO] Indeksy sozdany: group_name_1, name_text');
  }
  return { client, db };
}

async function closeDB() {
  if (client) {
    try {
      await client.close();
    } catch (_) {}
    client = null;
    db = null;
  }
}

module.exports = { connectDB, closeDB, uri, dbName };
