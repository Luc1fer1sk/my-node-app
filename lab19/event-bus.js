const { runBusDemo, startServer } = require('./task5');

const bus = runBusDemo();
startServer(bus, process.env.PORT || 3000);
