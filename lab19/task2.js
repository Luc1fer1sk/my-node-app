const EventEmitter = require('events');

function runOnceDemo() {
  const emitter = new EventEmitter();

  let onCount = 0;
  let onceCount = 0;

  emitter.on('tick', (num) => {
    onCount++;
    console.log(`[tick #${num}] on-slushatel`);
  });

  emitter.once('tick', (num) => {
    onceCount++;
    console.log(`[tick #${num}] once-slushatel`);
  });

  console.log('=== Sravnenie on i once ===');
  emitter.emit('tick', 1);
  emitter.emit('tick', 2);
  emitter.emit('tick', 3);

  console.log(`on-slushatel vyzvan: ${onCount} raza`);
  console.log(`once-slushatel vyzvan: ${onceCount} raz`);

  console.log('');
  console.log('=== Upravlenie podpiskami ===');

  const handlerA = () => {};
  const handlerB = () => {};
  const handlerC = () => {};

  emitter.on('action', handlerA);
  emitter.on('action', handlerB);
  emitter.on('action', handlerC);

  console.log(`Slushateley do udaleniya: ${emitter.listenerCount('action')}`);

  emitter.removeListener('action', handlerA);
  console.log(`Slushateley posle udaleniya odnogo: ${emitter.listenerCount('action')}`);

  emitter.removeAllListeners('action');
  console.log(`Slushateley posle removeAllListeners: ${emitter.listenerCount('action')}`);

  console.log('');
  console.log('=== Poryadok vyzova ===');

  emitter.on('order', () => {
    console.log('1. Pervyy slushatel (gruppa 477)');
  });
  emitter.on('order', () => {
    console.log('2. Vtoroy slushatel');
  });
  emitter.on('order', () => {
    console.log('3. Tretiy slushatel');
  });

  emitter.emit('order');
}

if (require.main === module) {
  runOnceDemo();
}

module.exports = {
  runOnceDemo
};
