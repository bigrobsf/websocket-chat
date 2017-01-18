/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */

'use strict';

// Creates a new WebSocket connection, which will fire the open event
let socket = new WebSocket('ws://localhost:3001', 'sample-protocol');

window.onload = () => {
  let messageField = document.getElementById('message-area');
  let messageList = document.getElementById('message-log');
  let socketStatus = document.getElementById('status');

  let closeBtn = document.getElementById('close');
  let openBtn = document.getElementById('open');
  let sendBtn = document.getElementById('send');

  // Set connection status on form to Connected
  socket.onopen = (event) => {
    socketStatus.innerHTML = 'Connected.';
    socketStatus.className = 'open';
  };

  // Listens for incoming messages. When a message is received, the message
  // event is handled by this function
  socket.onmessage = (event) => {
    let message = event.data;
    messageList.innerHTML += '<li class="received"><span>Received: </span>' +
                                message + '</li>';
  };

  // Handles errors. In this case it simply logs them
  socket.onerror = (error) => {
    console.log('WebSocket Error: ' + error);
  };

  // Set connection status on form to Disconnected
  socket.onclose = (event) => {
    socketStatus.innerHTML = 'Disconnected from WebSocket.';
    socketStatus.className = 'closed';
  };

  // Close the WebSocket connection when the Disconnect button is clicked
  closeBtn.onclick = (event) => {
    event.preventDefault();

    socket.close();

    return false;
  };

  // Reload the browser window when the Connect button is clicked
  openBtn.onclick = (event) => {
    window.location.reload(true);
  };

  // Calls the sendMessage function if the send button is clicked
  sendBtn.onclick = (event) => {
    sendMessage();
  };

  // Calls the sendMessage function if the enter key is pressed
  document.querySelector('#message-area').addEventListener('keypress', function (event) {
    event.stopPropagation();
    if(event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();

      sendMessage();

      return false;
    }
  });

  // =============================================================================
  // sends message to server
  function sendMessage() {
    let message = messageField.value;

    if (message.length > 0) {
      socket.send(message);
      messageList.innerHTML += '<li class="sent"><span>Sent: </span>' +
        message + '</li>';

      messageField.value = '';
      messageField.focus();
    }

    return false;
  }
};











// end
