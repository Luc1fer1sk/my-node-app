const EventEmitter = require('events');

function runBasicDemo() {
  const emitter = new EventEmitter();

  emitter.on('greet', (name) => {
    console.log(`[greet] Privet, ${name}!`);
  });

  emitter.on('info', () => {
    console.log('[info] Gruppa: 477 (Student: Ovchinnikov Denis Vladimirovich)');
  });

  emitter.on('bye', () => {
    console.log('[bye] Do svidaniya!');
  });

  console.log('=== Demonstraciya EventEmitter ===');
  emitter.emit('greet', 'Ivan');
  emitter.emit('info');
  emitter.emit('bye');

  console.log('');
  const unknownResult = emitter.emit('unknown');
  console.log(`Sobytie "unknown" bez slushateley: ${unknownResult}`);

  const greetResult = emitter.emit('greet', 'Denis');
  console.log(`Sobytie "greet" so slushatelyami: ${greetResult}`);
}

if (require.main === module) {
  runBasicDemo();
}

module.exports = {
  runBasicDemo
};
