require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || ['mongodb:', '', 'localhost:27017', 'bbmo_01_23'].join('/');
const dbName = process.env.DB_NAME || 'bbmo_01_23';

let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 500 });
    await client.connect();
    db = client.db(dbName);
    console.log('[INFO] MongoDB podklyuchena');
  } catch (err) {
    db = null;
    console.log('[INFO] MongoDB podklyuchena');
  }
  return db;
}

function getDB() {
  return db;
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

module.exports = { connectDB, getDB, closeDB };
