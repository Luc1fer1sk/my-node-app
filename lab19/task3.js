const EventEmitter = require('events');

class DatabaseConnection extends EventEmitter {
  constructor(group = '477') {
    super();
    this.group = group;
    this.isConnected = false;
  }

  connect() {
    this.emit('connect', `Podklyuchenie k BD dlya gruppy ${this.group} ustanovleno`);
    this.isConnected = true;
  }

  query(sql) {
    if (!this.isConnected) {
      this.emit('error', new Error('Net aktivnogo soedineniya s BD'));
      return;
    }
    let result = '';
    if (sql.toUpperCase().includes('SELECT')) {
      result = '50 zapisej';
    } else if (sql.toUpperCase().includes('INSERT')) {
      result = '1 zapis dobavlena';
    } else {
      result = 'Zapros uspeshno vypolnen';
    }
    this.emit('query', sql, result);
  }

  close() {
    this.isConnected = false;
    this.emit('close', 'Soedinenie zakryto');
  }

  error(msg) {
    this.emit('error', new Error(msg));
  }
}

function runClassDemo() {
  const db = new DatabaseConnection('477');

  db.on('connect', () => {
    console.log('[EVENT] Podklyuchenie k BD...');
    console.log('[EVENT] Soedinenie ustanovleno');
  });

  db.on('query', (sql, result) => {
    console.log(`[EVENT] Vypolnenie zaprosa: ${sql}`);
    console.log(`[EVENT] Rezultat: ${result}`);
  });

  db.on('close', () => {
    console.log('[EVENT] Zakrytie soedineniya');
    console.log('[EVENT] Soedinenie zakryto');
  });

  db.on('error', (err) => {
    console.log(`[EVENT] Oshibka: ${err.message}`);
  });

  console.log('=== DatabaseConnection (gruppa 477) ===');
  db.connect();
  db.query('SELECT * FROM students');
  db.query('INSERT INTO students');
  db.close();

  console.log('');
  console.log('=== Demonstraciya oshibki ===');
  db.error('Connection timeout');
  console.log('(bez slushatelya error process upal by s isklyucheniem)');
}

if (require.main === module) {
  runClassDemo();
}

module.exports = {
  DatabaseConnection,
  runClassDemo
};
