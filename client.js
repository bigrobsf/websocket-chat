/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */

'use strict';

let socket = new WebSocket('ws://localhost:1234', 'sample-protocol');
let clientID = createGUID();

window.onload = () => {
  let form = document.getElementById('message-form');
  let messageField = document.getElementById('message-area');
  let messagesList = document.getElementById('message-log');
  let socketStatus = document.getElementById('status');
  let closeBtn = document.getElementById('close');
  let openBtn = document.getElementById('open');

  socket.onopen = (event) => {
    socketStatus.innerHTML = 'Connected.';
    socketStatus.className = 'open';
  };

  openBtn.onclick = (event) => {
    window.location.reload(true);
  };

  socket.onerror = (error) => {
    console.log('WebSocket Error: ' + error);
  };

  form.onsubmit = (event) => {
    event.preventDefault();
    
    let message = messageField.value;
    let msg = createMsgJSON(clientID, message);

    socket.send(JSON.stringify(msg));

    messagesList.innerHTML += '<li class="sent"><span>Sent: </span>' + message + '</li>';

    messageField.value = '';
    messageField.focus();

    return false;
  };

  socket.onmessage = (event) => {
    let messageField = document.getElementById('message-area').contentDocument;
    let msg = JSON.parse(event.data);
    let time = new Date(msg.date);
    let timeStr = time.toLocaleTimeString();
    console.log(msg.id);

    if (msg.text.length) {
      messagesList.innerHTML += '<li class="received"><span>Received: ' + timeStr + '</span>' + msg.text + '</li>';
    }
  };

  socket.onclose = (event) => {
    socketStatus.innerHTML = 'Disconnected from WebSocket.';
    socketStatus.className = 'closed';
  };

  closeBtn.onclick = (event) => {
    event.preventDefault();

    socket.close();

    return false;
  };
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#message-area').addEventListener('keypress', function (event) {
    if(event.keyCode === 13 && !event.shiftKey) {
      let form = document.getElementById('message-form');
      let e = new Event('submit');

      form.dispatchEvent(e);
      event.preventDefault();

      return false;
    }
  });
});



// end
