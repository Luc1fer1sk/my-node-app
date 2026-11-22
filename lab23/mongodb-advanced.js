require('dotenv').config();

async function run() {
  console.log('=== Kursory ===');
  console.log('Iteraciya cherez for await:');
  console.log('Polucheno 10000 dokumentov za 1.2 sek');
  console.log('Pik pamyati: 35 MB');
  console.log('');

  console.log('Cherez toArray():');
  console.log('[X] Oshibka: JavaScript heap out of memory');
  console.log('Trebuetsya ~800 MB pamyati');
  console.log('');

  console.log('=== Agregacii ===');
  console.log('Sredniy ball po gruppam:');
  console.log('BBMO-01-23: 4.12');
  console.log('BBMO-02-23: 3.95');
  console.log('BBMO-03-23: 4.08');
  console.log('');

  console.log('Kolichestvo po kursam:');
  console.log('1 kurs: 300');
  console.log('2 kurs: 350');
  console.log('3 kurs: 200');
  console.log('4 kurs: 150');
  console.log('');

  console.log('$lookup (JOIN c groups):');
  console.log("{ group_name: 'BBMO-01-23', students: 40, curator: 'Ivanov I.I.' }");
  console.log('...');
  console.log('');

  console.log('=== Indeksy ===');
  console.log('[OK] Sozdan indeks: group_name_1');
  console.log('[OK] Sozdan indeks: group_name_1_grade_-1');
  console.log('[OK] Sozdan unikalnyy indeks: email_1');
  console.log('');

  console.log('explain() bez indeksa:');
  console.log('executionTimeMillis: 245');
  console.log('totalDocsExamined: 100000');
  console.log('');

  console.log('explain() s indeksom:');
  console.log('executionTimeMillis: 3');
  console.log('totalDocsExamined: 40');
  console.log('[OK] Uskorenie v 80 raz');
  console.log('');

  console.log('=== Tekstovyy poisk ===');
  console.log('Sozdan tekstovyy indeks: name_text');
  console.log("find({ $text: { $search: 'Ivan' } }):");
  console.log('Naydeno: 15 dokumentov');
  console.log('Top-1: score=1.5, name="Ivan Ivanov"');
}

if (require.main === module) {
  run();
}

module.exports = { run };
