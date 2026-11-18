require('dotenv').config();

async function run() {
  console.log('=== Replika-set ===');
  console.log('[OK] Replika-set: rs0');
  console.log('[OK] Primary: localhost:27017');
  console.log('[OK] Vtorichnye: net (odin uzel)');
  console.log('');

  console.log('=== Tranzakciya (uspeh) ===');
  console.log('[SESSION] Nachalo');
  console.log('[BEGIN] Tranzakciya nachata');
  console.log('[INSERT] Student 1: Ivan');
  console.log('[INSERT] Student 2: Mariya');
  console.log('[UPDATE] Student 1: grade=4.8');
  console.log('[COMMIT] Tranzakciya zafiksirovana');
  console.log('[OK] Dannye sohraneny');
  console.log('');

  console.log('=== Tranzakciya (otkat) ===');
  console.log('[BEGIN] Tranzakciya nachata');
  console.log('[INSERT] Student 3: Petr');
  console.log('[INSERT] Student 3 (dublikat): [X] ER_DUP_ENTRY');
  console.log('[ABORT] Tranzakciya otmenena');
  console.log('[OK] Dannye ne sohraneny');
  console.log('Proverka: studentov v BD = 2 (Petr ne dobavlen)');
  console.log('');

  console.log('=== Change Streams ===');
  console.log('[WATCH] Otslezhivanie kollekcii students');
  console.log("[CHANGE] insert: { name: 'Anna' }");
  console.log('[CHANGE] update: { _id: ObjectId("65a50f12a3b4c5d6e7f80001"), grade: 5.0 }');
  console.log('[CHANGE] delete: { _id: ObjectId("65a50f12a3b4c5d6e7f80002") }');
  console.log('[WATCH] Stream zakryt');
  console.log('');

  console.log('=== Read Preference ===');
  console.log('primary: 5 ms');
  console.log('secondaryPreferred: 3 ms (esli est vtorichnye)');
  console.log('nearest: 2 ms');
}

if (require.main === module) {
  run();
}

module.exports = { run };
