/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */
'use strict';

let http = require('http');
let WebSocketServer = require('websocket').server;

let server = http.createServer((request, response) => {});
let wsServer = new WebSocketServer({
  httpServer: server
});

let count = 0;
let clients = {};

wsServer.on('request', (req) => {
  let connection = req.accept('echo-protocol', req.origin);
  let id = count++;
  clients[id] = connection;

  console.log((new Date()) + ' Connection accepted [' + id + ']');

  connection.on('message', (message) => {
    let msgString = message.utf8Data;

    for (var key in clients) {
      clients[key].sendUTF(msgString);
    }
  });

  connection.on('close', (reasonCode, description) => {
    delete clients[id];
    console.log((new Date()) + ' Peer' + connection.remoteAddress + ' disconnected.');
  });
});

server.listen(1234, function() {
  console.log((new Date()) + ' Server is listening on port 1234');
});
