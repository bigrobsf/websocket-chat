/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */

'use strict';

let socket = new WebSocket('ws://localhost:3001', 'sample-protocol');
let clientKey = '';

window.onload = () => {
  let messageField = document.getElementById('message-area');
  let messagesList = document.getElementById('message-log');
  let socketStatus = document.getElementById('status');

  let closeBtn = document.getElementById('close');
  let openBtn = document.getElementById('open');
  let sendBtn = document.getElementById('send');

  socket.onopen = (event) => {
    socketStatus.innerHTML = 'Connected.';
    socketStatus.className = 'open';
  };

  socket.onerror = (error) => {
    console.log('WebSocket Error: ' + error);
  };

  socket.onmessage = (event) => {
    let messageField = document.getElementById('message-area').contentDocument;
    let msg = JSON.parse(event.data);
    console.log('client received: ', msg);

    let time = new Date(msg.date);
    let timeStr = time.toLocaleTimeString();

    switch(msg.type) {
      case 'id':
        clientKey = msg.clientKey;
        console.log('client key received: ', clientKey);
        break;
      case 'message':
        messagesList.innerHTML += '<li class="received"><span>Received: ' +
          timeStr + '</span>' + msg.text + '</li>';
        break;
      case 'confirmation':
        break;
    }
  };

  socket.onclose = (event) => {
    socketStatus.innerHTML = 'Disconnected from WebSocket.';
    socketStatus.className = 'closed';
  };

  openBtn.onclick = (event) => {
    window.location.reload(true);
  };

  closeBtn.onclick = (event) => {
    event.preventDefault();

    socket.close();

    return false;
  };

  sendBtn.onclick = (event) => {
    sendMessage();
  };

  document.querySelector('#message-area').addEventListener('keypress', function (event) {
    event.stopPropagation();
    if(event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();

      sendMessage();

      return false;
    }
  });

  function sendMessage() {
    let message = messageField.value;
    let msg = createMsgObj(message, clientKey);

    socket.send(JSON.stringify(msg));

    messagesList.innerHTML += '<li class="sent"><span>Sent: </span>' + message + '</li>';

    messageField.value = '';
    messageField.focus();

    return false;
  }
};

// =============================================================================
// consruct message object
function createMsgObj(message, clientKey) {
  let msg = {
    type: 'message',
    clientMsgId: createMsgId(),
    text: message,
    clientKey: clientKey,
    date: Date.now()
  };

  return msg;
}

// =============================================================================
// use closure to create and increment counter 
function createMsgId() {
  var counter = 0;
  return function() {
    return counter++;
  };
}







// end
