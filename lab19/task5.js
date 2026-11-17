const EventEmitter = require('events');
const http = require('http');

class EventBus extends EventEmitter {
  constructor(group = '477') {
    super();
    this.group = group;
    this.prioritizedListeners = new Map();
    this.anyListeners = [];
    this.metrics = {
      group: this.group,
      events: {},
      total: 0,
      errors: 0,
      listeners: {}
    };

    this.on('error', (err) => {
      this.metrics.errors++;
      console.log(`[ERROR] [${this.group}] Oshibka v slushatele: ${err.message}`);
    });
  }

  on(event, listener, priority = 0) {
    if (!this.prioritizedListeners.has(event)) {
      this.prioritizedListeners.set(event, []);
    }
    const list = this.prioritizedListeners.get(event);
    list.push({ listener, priority, once: false });
    list.sort((a, b) => b.priority - a.priority);
    this.updateListenerMetrics(event);
    return this;
  }

  once(event, listener, priority = 0) {
    if (!this.prioritizedListeners.has(event)) {
      this.prioritizedListeners.set(event, []);
    }
    const list = this.prioritizedListeners.get(event);
    list.push({ listener, priority, once: true });
    list.sort((a, b) => b.priority - a.priority);
    this.updateListenerMetrics(event);
    return this;
  }

  onAny(listener) {
    this.anyListeners.push(listener);
    return this;
  }

  off(event, listener) {
    if (this.prioritizedListeners.has(event)) {
      const list = this.prioritizedListeners.get(event);
      const filtered = list.filter((item) => item.listener !== listener);
      this.prioritizedListeners.set(event, filtered);
      this.updateListenerMetrics(event);
    }
    return this;
  }

  emit(event, ...args) {
    this.metrics.total++;
    this.metrics.events[event] = (this.metrics.events[event] || 0) + 1;

    this.anyListeners.forEach((fn) => {
      try {
        fn(event, args);
      } catch (err) {
        this.emit('error', err);
      }
    });

    if (!this.prioritizedListeners.has(event)) {
      return false;
    }

    const list = [...this.prioritizedListeners.get(event)];
    const remaining = [];

    list.forEach((item) => {
      try {
        item.listener(...args);
      } catch (err) {
        this.emit('error', err);
      }
      if (!item.once) {
        remaining.push(item);
      }
    });

    this.prioritizedListeners.set(event, remaining);
    this.updateListenerMetrics(event);
    return true;
  }

  updateListenerMetrics(event) {
    const count = this.prioritizedListeners.has(event) ? this.prioritizedListeners.get(event).length : 0;
    this.metrics.listeners[event] = count;
  }

  getMetrics() {
    return {
      group: this.group,
      events: this.metrics.events,
      total: this.metrics.total,
      errors: this.metrics.errors,
      listeners: this.metrics.listeners
    };
  }
}

function runBusDemo() {
  const bus = new EventBus('477');

  console.log('=== EventBus (gruppa 477) ===');

  console.log('');
  console.log('--- Prioritety ---');
  bus.on('action', () => console.log('[priority 0] Nizkiy prioritet'), 0);
  bus.on('action', () => console.log('[priority 10] Vysokiy prioritet'), 10);
  bus.on('action', () => console.log('[priority 5] Sredniy prioritet'), 5);
  bus.emit('action');

  console.log('');
  console.log('--- Wildcard ---');
  bus.onAny((event, args) => {
    console.log(`[onAny] Sobytie "${event}" s argumentami: ${JSON.stringify(args)}`);
  });
  bus.emit('greet', 'Ivan');
  bus.emit('info', '477');

  console.log('');
  console.log('--- Once-kesh ---');
  let onceCalls = 0;
  bus.once('tick', () => {
    onceCalls++;
  });
  console.log('[tick] Vyzov 1');
  bus.emit('tick');
  console.log('[tick] Vyzov 2');
  bus.emit('tick');
  console.log('[tick] Vyzov 3');
  bus.emit('tick');
  console.log(`once-slushatel vyzvan: ${onceCalls} raz`);

  console.log('');
  console.log('--- Obrabotka oshibok ---');
  bus.on('test_err', () => {
    throw new Error('Oshibka v slushatele "test"');
  });
  bus.emit('test_err');

  console.log('');
  console.log('--- Metriki ---');
  const metrics = bus.getMetrics();
  Object.keys(metrics.events).forEach((evt) => {
    console.log(`${evt}: ${metrics.events[evt]} vyzov(ov)`);
  });
  console.log(`Vsego sobytiy: ${metrics.total}`);

  return bus;
}

function startServer(bus, port = 3000) {
  const server = http.createServer((req, res) => {
    bus.emit('request', req.method, req.url);

    if (req.url === '/metrics') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(bus.getMetrics(), null, 2));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('EventBus HTTP Server (gruppa 477)');
  });

  server.listen(port, () => {
    console.log(`HTTP-server zapushchen na portu ${port}: http://localhost:${port}`);
  });
  return server;
}

if (require.main === module) {
  const bus = runBusDemo();
  const args = process.argv.slice(2);
  if (!args.includes('--no-server')) {
    startServer(bus, process.env.PORT || 3000);
  }
}

module.exports = {
  EventBus,
  runBusDemo,
  startServer
};
