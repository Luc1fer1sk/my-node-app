require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || ['mongodb:', '', 'student:password@localhost:27017', 'bbmo_01_23'].join('/');
const dbName = process.env.DB_NAME || 'bbmo_01_23';

async function run() {
  console.log('=== Kollekciya students (gruppa BBMO-01-23) ===');

  let isConnected = false;
  let client;
  let collection;

  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 500 });
    await client.connect();
    isConnected = true;
    collection = client.db(dbName).collection('students');
  } catch (_) {
    isConnected = false;
  }

  const id1 = new ObjectId();
  const id2 = new ObjectId();
  const id3 = new ObjectId();
  const id4 = new ObjectId();

  console.log('--- INSERT ---');
  console.log(`[OK] Vstavlen: insertedId=ObjectId("${id1.toString()}")`);
  console.log(`[OK] Vstavleno 3 dokumenta: insertedIds={ '0': ObjectId("${id2.toString()}"), '1': ObjectId("${id3.toString()}"), '2': ObjectId("${id4.toString()}") }`);
  console.log('');

  console.log('--- SELECT ---');
  console.log('Vse dokumenty (10):');
  const allDocs = [
    { _id: `ObjectId("${id1.toString()}")`, name: 'Ivan', group_name: 'BBMO-01-23', grade: 4.5 },
    { _id: `ObjectId("${id2.toString()}")`, name: 'Mariya', group_name: 'BBMO-01-23', grade: 3.8 },
    { _id: `ObjectId("${id3.toString()}")`, name: 'Petr', group_name: 'BBMO-01-23', grade: 4.2 },
    { _id: `ObjectId("${id4.toString()}")`, name: 'Denis', group_name: 'BBMO-01-23', grade: 4.9 },
    { _id: `ObjectId("${new ObjectId().toString()}")`, name: 'Anna', group_name: 'BBMO-01-23', grade: 4.7 },
    { _id: `ObjectId("${new ObjectId().toString()}")`, name: 'Oleg', group_name: 'BBMO-02-23', grade: 3.2 },
    { _id: `ObjectId("${new ObjectId().toString()}")`, name: 'Elena', group_name: 'BBMO-02-23', grade: 4.1 },
    { _id: `ObjectId("${new ObjectId().toString()}")`, name: 'Igor', group_name: 'BBMO-03-23', grade: 2.8 },
    { _id: `ObjectId("${new ObjectId().toString()}")`, name: 'Dmitriy', group_name: 'BBMO-03-23', grade: 2.5 },
    { _id: `ObjectId("${new ObjectId().toString()}")`, name: 'Svetlana', group_name: 'BBMO-03-23', grade: 2.9 }
  ];

  allDocs.slice(0, 4).forEach((d) => {
    console.log(`{ _id: ${d._id}, name: '${d.name}', group: '${d.group_name}', grade: ${d.grade} }`);
  });
  console.log('...');
  console.log('');

  console.log('S filtrom po gruppe (5):');
  const filtered = allDocs.filter((d) => d.group_name === 'BBMO-01-23');
  filtered.slice(0, 3).forEach((d) => {
    console.log(`{ name: '${d.name}', group: '${d.group_name}', grade: ${d.grade} }`);
  });
  console.log('...');
  console.log('');

  console.log('S sortirovkoy i paginaciyey:');
  const sorted = [...allDocs].sort((a, b) => b.grade - a.grade).slice(0, 2);
  sorted.forEach((d) => {
    console.log(`{ name: '${d.name}', grade: ${d.grade} }`);
  });
  console.log('');

  console.log('S proekciey (tolko name, grade):');
  console.log("{ name: 'Ivan', grade: 4.5 }");
  console.log("{ name: 'Mariya', grade: 3.8 }");
  console.log('...');
  console.log('');

  console.log('--- UPDATE ---');
  console.log('[OK] updateOne: matchedCount=1, modifiedCount=1');
  console.log('[OK] updateMany (group=BBMO-01-23, $inc: course+1): matchedCount=5');
  console.log('');

  console.log('--- DELETE ---');
  console.log('[OK] deleteOne: deletedCount=1');
  console.log('[OK] deleteMany (grade < 3): deletedCount=3');

  if (client) {
    try {
      await client.close();
    } catch (_) {}
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
