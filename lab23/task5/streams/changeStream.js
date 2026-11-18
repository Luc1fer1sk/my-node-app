const { WebSocketServer } = require('ws');

let wss = null;

function initWebSocket(port = 3001) {
  if (wss) return wss;
  wss = new WebSocketServer({ port });
  console.log(`[INFO] WebSocket na portu ${port}`);

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ event: 'connected', message: 'WebSocket soedinenie ustanovleno' }));
  });

  return wss;
}

function broadcastChange(operationType, doc) {
  if (!wss) return;
  const msg = JSON.stringify({ operationType, document: doc });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

function closeWebSocket() {
  if (wss) {
    wss.close();
    wss = null;
  }
}

module.exports = { initWebSocket, broadcastChange, closeWebSocket };
