const EventEmitter = require('events');

class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();

    this.on('newListener', (event) => {
      console.log(`[newListener] Dobavlen slushatel "${event}"`);
    });

    this.on('removeListener', (event) => {
      console.log(`[removeListener] Udalyon slushatel "${event}"`);
    });
  }

  register(name, events = {}) {
    console.log(`[PLUGIN] Zaregistrirovan: ${name}`);
    this.plugins.set(name, events);
    Object.keys(events).forEach((evt) => {
      this.on(evt, events[evt]);
    });
    this.emit('plugin:registered', name);
  }

  unregister(name) {
    const events = this.plugins.get(name);
    if (events) {
      Object.keys(events).forEach((evt) => {
        this.removeListener(evt, events[evt]);
      });
      this.plugins.delete(name);
      console.log(`[PLUGIN] Udalyon: ${name}`);
      this.emit('plugin:removed', name);
    }
  }
}

function runAdvancedDemo() {
  console.log('=== Sistema plaginov ===');
  const pm = new PluginManager();

  pm.on('plugin:registered', () => {});
  pm.on('plugin:removed', () => {});

  const logHandler = () => {};
  const alertHandler = () => {};

  pm.register('LoggerPlugin', { log: logHandler });
  pm.register('AlertPlugin', { alert: alertHandler });

  pm.unregister('LoggerPlugin');

  console.log('');
  console.log('=== Demonstraciya utechki ===');
  const leakEmitter = new EventEmitter();
  leakEmitter.setMaxListeners(2000);

  for (let i = 0; i < 10; i++) {
    leakEmitter.on('leakEvent', () => {});
  }
  console.log(`Slushateley do: ${leakEmitter.listenerCount('leakEvent')}`);

  for (let i = 0; i < 1000; i++) {
    leakEmitter.on('leakEvent', () => {});
  }
  console.log(`Slushateley posle dobavleniya 1000: ${leakEmitter.listenerCount('leakEvent')}`);

  leakEmitter.removeAllListeners('leakEvent');
  console.log(`Slushateley posle removeAllListeners: ${leakEmitter.listenerCount('leakEvent')}`);

  console.log('');
  console.log('=== Asinhronnye slushateli ===');
  const asyncEmitter = new EventEmitter();

  asyncEmitter.on('asyncEvent', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log('[477] async-slushatel zavershyon cherez 100ms');
  });

  asyncEmitter.emit('asyncEvent');
  console.log('[477] emit vyzvan (ne zhdyot async-slushatel)');

  return new Promise((r) => setTimeout(r, 150));
}

if (require.main === module) {
  runAdvancedDemo();
}

module.exports = {
  PluginManager,
  runAdvancedDemo
};
