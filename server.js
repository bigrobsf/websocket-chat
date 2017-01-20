/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */
'use strict'; // optional

const PORT = process.env.PORT || 3001;
const express = require('express');
const app = express();

let server = require('http').Server(app);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

let WebSocketServer = require('websocket').server;

let wsServer = new WebSocketServer({
  httpServer: server
});

let clients = {};

// listens for connection requests, stores the client info, and sends it to client
wsServer.on('request', function(req) {
  let connection = req.accept('sample-protocol', req.origin);
  let id = createUUID();

  clients[id] = connection;

  let idObj = createIdObj(id);

  clients[id].send(JSON.stringify(idObj));

  console.log((new Date()) + ' Connection accepted [' + id + ']');

  // listens for incoming messages and broadcasts them to all other clients
  connection.on('message', function(message) {
    let msgString = message.utf8Data;
    let msgObj = JSON.parse(msgString);

    let receivedId = msgObj.clientKey;

    // clear client ID from message before broadcasting to other clients
    msgObj.clientKey = '';

    msgString = JSON.stringify(msgObj);

    for (let id in clients) {
      if (id !== receivedId) {
        clients[id].sendUTF(msgString);
      }
    }
  });

  // listens for close requests
  connection.on('close', function(reasonCode, description) {
    delete clients[id];

    console.log((new Date()) + ' Peer' + connection.remoteAddress +
      ' disconnected. Reason code: ' + reasonCode + '.');
  });
});

// =============================================================================
// UUID generator - not guaranteed to be unique, but good enough for demo purposes
function createUUID() {
  return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// =============================================================================
// construct clientID object
function createIdObj(id) {
  let initMsg = {
    type: 'id',
    clientKey: id,
    date: Date.now()
  };

  return initMsg;
}

// =============================================================================
// Fire up the server
server.listen(PORT, function() {
  console.log((new Date()) + ' Server is listening on port ' + PORT);
});
