/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */
'use strict';

const PORT = 3001;

let http = require('http');
let WebSocketServer = require('websocket').server;

let server = http.createServer((req, res) => {});

let wsServer = new WebSocketServer({
  httpServer: server
});

let clients = {};
let count = 0;

// listens for connection requests and stores the client info
wsServer.on('request', (req) => {
  let connection = req.accept('sample-protocol', req.origin);

  let id = count++;

  clients[id] = connection;

  console.log((new Date()) + ' Connection accepted [' + id + ']');

  // listens for incoming messages and broadcasts them to all clients
  connection.on('message', (message) => {
    let msgString = message.utf8Data;
    console.log('server received message: ', message);

    for (let id in clients) {
      clients[id].sendUTF(msgString);
    }
  });

  // listener for close requests
  connection.on('close', (reasonCode, description) => {
    delete clients[id];
    console.log((new Date()) + ' Peer' + connection.remoteAddress +
      ' disconnected. Reason code: ' + reasonCode + '.');
  });
});

// =============================================================================
// Fire up the server
server.listen(PORT, () => {
  console.log((new Date()) + ' Server is listening on port ' + PORT);
});
