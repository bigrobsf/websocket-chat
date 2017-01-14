/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */
'use strict';

const PORT = 3001;

let http = require('http');
let WebSocketServer = require('websocket').server;

let server = http.createServer((req, res) => {
  console.log(req.url);
});

let wsServer = new WebSocketServer({
  httpServer: server
});

let clients = {};

wsServer.on('request', (req) => {
  let connection = req.accept('sample-protocol', req.origin);
  let id = createGUID();

  clients[id] = connection;

  let idObj = createIdObj(id);

  clients[id].send(JSON.stringify(idObj));

  console.log((new Date()) + ' Connection accepted [' + id + ']');

  connection.on('message', (message) => {
    let msgString = message.utf8Data;
    let msgObj = JSON.parse(msgString);

    console.log(msgObj);
    let receivedId = msgObj.clientKey;

    msgString = JSON.stringify(msgObj);

    for (var id in clients) {
      if (id !== receivedId) clients[id].sendUTF(msgString);
    }
  });

  connection.on('close', (reasonCode, description) => {
    delete clients[id];
    console.log((new Date()) + ' Peer' + connection.remoteAddress + ' disconnected.');
  });
});

// =============================================================================
// GUID generator - not guaranteed to be unique, but good enough for demo purposes
function createGUID() {
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




// end
