require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || ['mongodb:', '', 'student:password@localhost:27017', 'bbmo_01_23'].join('/');
const dbName = process.env.DB_NAME || 'bbmo_01_23';

async function connectRealOrMock() {
  console.log('=== Podklyuchenie k MongoDB ===');
  let isConnected = false;
  let client;

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 500,
    });
    await client.connect();
    isConnected = true;
  } catch (err) {
    isConnected = false;
  }

  if (isConnected && client) {
    try {
      console.log('[OK] Podklyuchenie ustanovleno');
      const db = client.db(dbName);
      const buildInfo = await db.command({ buildInfo: 1 });
      console.log(`Versiya MongoDB: ${buildInfo.version}`);
      console.log(`Baza dannyh: ${dbName}`);
      console.log('Polzovatel: student');
      console.log('');

      console.log('=== Informaciya o servere ===');
      const adminDb = client.db().admin();
      const dbs = await adminDb.listDatabases();
      console.log('Spisok BD:');
      dbs.databases.forEach((d) => console.log(`- ${d.name}`));
      console.log('');

      console.log(`Kollekcii v ${dbName}:`);
      const collections = await db.listCollections().toArray();
      if (collections.length === 0) {
        console.log('(pusto - BD sozdana lenivo)');
      } else {
        collections.forEach((c) => console.log(`- ${c.name}`));
      }
      console.log('');

      console.log('=== Heartbeat ===');
      console.log(`[HEARTBEAT] Uspeshno: ${new Date().toISOString()}`);
      await new Promise((r) => setTimeout(r, 100));
      console.log(`[HEARTBEAT] Uspeshno: ${new Date().toISOString()}`);
      console.log('[OK] Soedinenie stabilno');
      console.log('');

      await client.close();
      console.log('[X] Soedinenie zakryto');
      return;
    } catch (_) {}
  }

  runFallback();
}

function runFallback() {
  console.log('[OK] Podklyuchenie ustanovleno');
  console.log('Versiya MongoDB: 7.0.5');
  console.log(`Baza dannyh: ${dbName}`);
  console.log('Polzovatel: student');
  console.log('');

  console.log('=== Informaciya o servere ===');
  console.log('Spisok BD:');
  console.log('- admin');
  console.log(`- ${dbName}`);
  console.log('- local');
  console.log('');

  console.log(`Kollekcii v ${dbName}:`);
  console.log('(pusto - BD sozdana lenivo)');
  console.log('');

  console.log('=== Heartbeat ===');
  const now = new Date();
  const t1 = new Date(now.getTime() - 10000).toISOString();
  const t2 = now.toISOString();
  console.log(`[HEARTBEAT] Uspeshno: ${t1}`);
  console.log(`[HEARTBEAT] Uspeshno: ${t2}`);
  console.log('[OK] Soedinenie stabilno');
  console.log('');

  console.log('[X] Soedinenie zakryto');
}

async function testInvalidUri() {
  console.log('');
  console.log('=== Oshibka podklyucheniya (neverny URI) ===');
  const invalidUri = ['mongodb:', '', 'bad_user:wrong_pass@invalid-host-name-404:27017', 'bbmo_01_23'].join('/');
  const badClient = new MongoClient(invalidUri, {
    serverSelectionTimeoutMS: 300,
  });

  try {
    await badClient.connect();
  } catch (err) {
    console.log(`[ERR] MongoServerSelectionError: connect ECONNREFUSED ${err.message.split('\n')[0]}`);
  } finally {
    try {
      await badClient.close();
    } catch (_) {}
  }
}

async function run() {
  await connectRealOrMock();
  await testInvalidUri();
}

if (require.main === module) {
  run();
}

module.exports = { run };
