# HTML WebSockets: How to build a simple chat Node.js application in JavaScript
by Rob Conner


## Prerequisite Skills

*	Beginner to Intermediate JavaScript
* Some knowledge of HTML and CSS is helpful
*	Node.js
*	Familiarity using a command line interface

## Development Environment

You'll need:

* A code-friendly text editor (for example, Atom or Sublime Text)
* Node.js
* A compatible browser. This has been tested on recent versions of Chrome, Safari, and Firefox for OS X.

Install two npm packages from the command line:

* `npm install websocket`
* `npm install nodemon`

Nodemon is a package that will automate restarting your server after each edit. If you haven't used it before, you'll appreciate it!

## Technology

**Node.js** is an open-source, cross-platform JavaScript runtime environment for developing tools and applications. It uses the Google V8 engine (built for Google Chrome) to interpret JavaScript. Node.js has an event-driven architecture that is non-blocking and supports asynchronous input/output. It seeks to optimize throughput and scalability, which makes it ideal for building web servers and real-time web applications such as chat apps and browser games.

**WebSockets** is an API introduced with the HTML5 specification. The technology allows for a continuous bi-directional connection between a client and server. This makes it ideal for messaging / chat applications. The client is usually a user’s browser and thus the client-side is implemented using HTML and JavaScript. The server, however, can be implemented on any number of platforms though in this tutorial we will build the server using JavaScript and Node.js.

# Tutorial

## Introduction - Why WebSockets?

For many years, the web’s communication paradigm was that a client, usually via a web browser, requested data from a server. The server then responded to those requests. As the years passed, web applications matured, became more powerful and complex, and consumed increasing amounts of data. However, the existing HTTP model of client-initiated communication limited their usefulness and usability. Several work-arounds were developed, one of the most popular of which was long-polling.

Long-polling involves keeping an HTTP connection open until the server has data it can push to the client. However, this and other solutions carried the overhead that comes with HTTP. Each HTTP request requires that request headers and cookie data be transferred to the server, which increases latency (increases the time it takes for the server to respond). What was needed was a way of creating a persistent, low latency connection that could support transactions initiated by *either* the client or server.

The WebSockets protocol meets this requirement by establishing a persistent socket connection between the client and server. Once the connection is created, it will remain open until the client or server wants to close it. This significantly reduces the burden on the server and is well-suited for low latency applications. In this tutorial, you are going to learn how to use WebSockets to build a messaging app, which will hopefully help you use this awesome protocol in your own applications. But first, a high-level overview of how the WebSockets protocol works…

A client establishes a WebSocket connection with a server through a process known as *the WebSocket handshake*. First, the client sends a regular HTTP request to the server. An Upgrade header is included in this request that informs the server that the client wishes to establish a WebSocket connection. If the server supports the WebSocket protocol, it grants the upgrade and sends an Upgrade header in its response.

Once the handshake is complete, the original HTTP connection is changed to a WebSocket connection that uses the same underlying TCP/IP connection. Data can now be sent in either direction over the connection.

Now that you have a bit of background, let’s make this happen! For this tutorial (assuming you already have a JavaScript development environment set up on your computer) you'll just need access to somewhere that has Node.js installed along with its URL or IP address. Conveniently, this can even be your own computer.

## Part 1 – The Server

Our server will be responsible for listening for connection requests and inbound messages, broadcasting the messages to clients, and listening for disconnection requests. In part three, we will also enhance its ability to keep track of clients, which will allow us to add useful features!
I should add that our server won’t be secure. A production server should also check the origin of requests and prevent code injection.

Here’s what we’ll do to get the server-side up and running:
* Create an instance of the server and listen to a specific port
* Create the web socket server
* Listen for connections
* Add the code that will execute when a connection is established

### Create the Server and Listen

Open a blank text document and save it as **server.js**. This is where we’ll require the `http` library and create the server:

```javascript
let http = require('http');
let server = http.createServer(function(req, res) {});
```

**req** and **res** are commonly used in place of **request** and **response**, parameters of the `requestListener` function that is automatically added to the **request** event. The callback function within `createServer()` is empty as we're not actually serving anything through an HTTP request.

Next, we need to have the server listen on a particular port. I'll use port **3001**:

```javascript
const PORT = 3001;
server.listen(PORT, function() {
  console.log((new Date()) + ' Server is listening on port ' + PORT);
});
```

We pass in the PORT variable here as the first parameter. It is the port that we want to listen to. The second parameter is a callback function that in this case simply outputs a message to let us know that the server is running. Type `nodemon server.js` at the command line and you should see something like this:

`Mon Jan 16 2017 15:27:42 GMT-0800 (PST) Server is listening on port 3001`

We have an HTTP server running and listening on port 3001, so let’s use this to create our WebSockets server.

### Create the WebSockets Server

First, we need to require the **websocket** library, which you should have installed earlier:

```javascript
let WebSocketServer = require('websocket').server;
let wsServer = new WebSocketServer({
  httpServer: server
});
```

Now that we have a WebSockets server that is ready to run, we can start adding some event listeners. In this case, we only need to add one that listens for a connection request:

### Listening for Connections

To do this, we use the `.on` method of the **WebSocketServer** object that we created earlier and listen for the event **request**. We then provide a callback that will contain all of the code that will execute each time someone joins to the socket server.

```javascript
wsServer.on('request', function(req) {
  // we'll add code here next that will run on connection
});
```

### Callback for Connections

This is the code that will be placed within function `wsServer.on()`. It will need to:
* Accept the connection
* Create a new connection for each client
* Listen for incoming messages and broadcast them to clients
* Listen for a client disconnecting and remove it from the client list

#### Accept the Connection

Upon accepting a connection request, we are given an object that represents the client’s connection. In Part 2, the client will be sending *sample-protocol* as the connection’s protocol string to the accept method of the request object (which we have identified below as **req**):

```javascript
let connection = req.accept('sample-protocol', req.origin);
```

The server will use this connection to send messages to the client.

#### Store Connected Clients

Let’s create an object that will track clients as well as a variable we can increment to identify each client. Type these two lines before the `wsServer.on()` event listener:

```javascript
let count = 0;
let clients = {};
```

Next, within the event listener, we need to store the id and connection for this client so we can later loop through and broadcast to all clients:

```javascript
let id = count++;
clients[id] = connection;
```

This next line of code is an optional logging message that shows that the server has opened a connection with a new client:

```javascript
console.log((new Date()) + ' Connection accepted [' + id + ']');
```

#### Listen for Incoming Messages and Broadcast

Now we can attach event listeners to the connection. First, let’s add one that listens for messages sent from the connected clients. Within this, we want to take the message that they have sent to the server and send it out to every other client that is connected. This is very simple but it will also echo the message back to the originating client. In Part 3, we’ll add code that will suppress this behavior.

```javascript
// Create event listener
connection.on('message', function(message) {
  // The string message that was sent to us
  let msgString = message.utf8Data;

  // Loop through all clients
  for(let id in clients){
    // Send the message to all clients
    clients[id].sendUTF(msgString);
  }
});
```

Also in Part 3, we’ll upgrade this simple message string to a JSON object that will contain metadata such as a message ID, a client identifier, and a time stamp.

#### Listen for Client Disconnection

This function will listen for the close event and remove the disconnecting client from the client storage object. We’ll have the server log the disconnection so we can see when it happens.

```javascript
connection.on('close', function(reasonCode, description) {
  delete clients[id];
  console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. Reason code: ' + reasonCode);
});
```

And that’s our server! Later we’ll add some code to make it a bit more sophisticated, but for now we have a simple server that will accept WebSocket connections and broadcast received messages out to every connected client.
Next stop, the client-side!

### Code Check

At this point, your server code should look very similar to this:

```javascript
'use strict'; // optional

const PORT = process.env.PORT || 3001;

let http = require('http');
let WebSocketServer = require('websocket').server;

let server = http.createServer(function(req, res) {});

let wsServer = new WebSocketServer({
  httpServer: server
});

let clients = {};
let count = 0;

// Listens for connection requests and stores the client info
wsServer.on('request', function(req) {
  let connection = req.accept('sample-protocol', req.origin);
  let id = count++;

  clients[id] = connection;

  console.log((new Date()) + ' Connection accepted [' + id + ']');

  // Listens for incoming messages and broadcasts them to all clients
  connection.on('message', function(message) {
    let msgString = message.utf8Data;

    for (let id in clients) {
      clients[id].sendUTF(msgString);
    }
  });

  // Listens for close requests
  connection.on('close', function(reasonCode, description) {
    delete clients[id];
    console.log((new Date()) + ' Peer' + connection.remoteAddress +
      ' disconnected. Reason code: ' + reasonCode + '.');
  });
});

// =============================================================================
// Fire up the server
server.listen(PORT, function() {
  console.log((new Date()) + ' Server is listening on port ' + PORT);
});

```

## Part 2 – The Client

The client-side has a few ingredients in addition to JavaScript. We need to have an HTML page for the user to interact with and optionally some CSS to make the interface reasonably attractive. First, the HTML.

### **HTML**

Copy and paste the below into an **index.html** file in the same directory as your **server.js** file:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Hit Me Up</title>
</head>
<body>
  <div id="wrapper">
    <h1>Hit Me Up</h1>

    <div id="status">Connecting...</div>

    <ul id="message-log"></ul>

    <div id="message-form">
      <textarea id="message-area" placeholder="Type your message here..." autofocus="true" required>
      </textarea>
      <button type="button" class="send" id="send">Send</button>
      <div id="connect-action">
        <button type="button" class="connect" id="open">Connect</button>
        <button type="button" class="disconnect" id="close">Disconnect</button>
      </div>
    </div>
  </div>

  <script src="client.js"></script>
</body>
</html>
```

This provides a few important user interface elements; a `<div>` that shows the connection status, an `<ul>` that will display the message history, and a form for entering messages. The styling for the HTML is located at the end of this section.

### **JavaScript**

We’re now ready to start coding the client-side of our chat app! Open a blank text document and save it as **client.js** (for simplicity, we're keeping all files in the same directory). Here's what the client-side will handle:

* Opening a Connection
* Sending Messages to the Server
* Receiving Message from the Server
* Errors
* Closing the Connection

We’ll start by defining the `window.onload` function, which won’t execute until the HTML page has fully loaded.

Inside the function, we need to declare several variables and initialize them by getting key elements on the page:

```javascript
window.onload = function() {
  let messageField = document.getElementById('message-area');
  let messageList = document.getElementById('message-log');
  let socketStatus = document.getElementById('status');

  let closeBtn = document.getElementById('close');
  let openBtn = document.getElementById('open');
  let sendBtn = document.getElementById('send');

  // we will put more code here next
};
```

### Open a Connection

Creating a new WebSockets connection is easy – just call the WebSocket constructor and pass the URL of your server as a parameter. The second parameter, the protocol string, is user-defined and optional but must match that of the server. Once the connection has been established, the `open` event will be fired on the WebSocket instance.

Add the below code just before `window.onload()`:

```javascript
let socket = new WebSocket('ws://localhost:3001', 'sample-protocol');
```

The following event listener isn’t required but will update the connection status `div` to let the user know that a connection has been made with the server. The code also adds the class "open" to the status `<div>` solely for styling purposes. Add the below to your **client.js** file inside of `window.onload()`:

```javascript
// Set connection status on form to Connected
socket.onopen = function(event) {
  socketStatus.innerHTML = 'Connected.';
  socketStatus.className = 'open';
};
```

If we add the below code as well, you’ll be able to open a new connection or reconnect without refreshing the web page. Just click the **Connect** button!

```javascript
// Reload the browser window when the Connect button is clicked
openBtn.onclick = function(event) {
  window.location.reload(true);
};
```

### Sending Messages

Use the `send()` method of your WebSocket instance to send a message through the WebSocket connection. The data parameter can represent either text or binary data:
```javascript
socket.send(data);
```

For now, we will just be sending simple text strings. Our client app will have two ways to send a message; by clicking the **Send** button or by pressing **Enter** or **Return** from within the message field. The listener for each will call the `sendMessage()` function, which gets the message from the **messageField** and sends it through the WebSocket.

The message is also added to the **messageList** and shown on the screen. Finally, the **messageField** is reset and focus is restored so the user can type another message without needing to click in the field.

Add the below to your **client.js** file inside of `window.onload()`.

```javascript
// Calls the sendMessage function if the send button is clicked
sendBtn.onclick = function(event) {
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

// Sends message to server
function sendMessage() {
  let message = messageField.value;

  if (message.length > 0) {
    socket.send(message);
    messageList.innerHTML += '<li class="sent"><span>Sent: </span>' + message + '</li>';

    messageField.value = '';
    messageField.focus();
  }

  return false;
}
```

In Part 3, we will update the code to send JSON strings that contain additional information.

### Receiving Messages

To receive messages from the server, we need to use the `onmessage()` method of our WebSocket instance. The method will fire a **message** event when a message is received. This event has a property called `data` that we can use to access the contents of the message.

Create an event listener that will fire upon receipt of a message. This code will also retrieve the message and display it in the **messageList**.

Type the below code inside of `window.onload()`:

```javascript
socket.onmessage = function(event) {
  let message = event.data;

  messageList.innerHTML += '<li class="received"><span>Received: </span>' +     message + '</li>';
};
```
### Handling Errors

Errors are handled by listening for an error event. For this tutorial, we will just log any errors that occur to the console. Add the below inside of `window.onload()`:

```javascript
// Handles errors. In this case it simply logs them
socket.onerror = function(error) {
  console.log('WebSocket Error: ' + error);
};
```

### Closing the Connection

The client closes the WebSocket connection using the `close()` method.

```javascript
socket.close();
```

Now let’s create an event listener that fires when the user clicks the **Disconnect** button. This will call the `close()` method of our WebSocket instance.

```javascript
// Closes the connection when the Disconnect button is clicked
closeBtn.onclick = function(event) {
  event.preventDefault();

  socket.close();

  return false;
};
```
Lastly, we’ll finish our initial implementation of the client by adding code to update the connection status to **Disconnected**:

```javascript
// Set connection status on form to Disconnected
socket.onclose = function(event) {
  socketStatus.innerHTML = 'Disconnected from WebSocket.';
  socketStatus.className = 'closed';
};
```

And we’re done! At least for now. Spend a few minutes test driving your work (if something isn't working, there's a code check at the bottom of each section).

Start your server at the command line by typing `nodemon server.js` from within your project directory. Next, open the **index.html** file in two different browser windows or even two different browsers and send messages between them.

What happens when you send a message? Do you *really* want the message to be sent back to yourself?

![alt text](https://github.com/bigrobsf/websocket-chat/blob/master/public/images/hitmeup_nocss.jpg "Form with no CSS")

In Part 3, we’ll add a few more features that will make it more closely resemble a production-ready messaging app.

### **CSS**

Our app is working as expected, but the message field is rather cramped and the interface isn’t very nice to look at. How about we add some styling so it looks like this?

![alt text](https://github.com/bigrobsf/websocket-chat/blob/master/public/images/hitmeupv1c.jpg "Form with CSS")

What a difference! To make this happen, we’ll create a **css** file and add a link to it from our **index.html** page.

First, add the below line inside the `<head>` section just below the `<title>` tag:
```html
<link rel='stylesheet' href='style.css'>
```
Next, copy and paste the following into a **style.css** file in your project directory:
```css
*, *:before, *:after {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

html {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 100%;
  background: #616161;
}

/* =============================================================================
Form */
h1 {
  margin-top: 0;
  color: #424242;
}

#wrapper {
  width: 640px;
  background: #e0e0e0;
  padding: 14px;
  margin: 40px auto;
  border-top: 5px solid #263238;
  border-bottom: 5px solid #37474f;
}

#status {
  font-size: 15px;
  margin-bottom: 15px;
}

#connect-action {
  float: right;
}

.open {
  color: #43a047;
}

.closed {
  color: #e53935;
}

/* =============================================================================
Message log */
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 16px;
}

ul li {
  padding: 8px 12px;
  border-bottom: 1px solid #bdbdbd;
}

ul li:first-child {
  border-top: 1px solid #bdbdbd;
}

ul li span {
  display: inline-block;
  width: 90px;
  font-weight: bold;
  color: #757575;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sent {
  background-color: #FFF;
  color: #1e88e5
}

/* =============================================================================
Message composition area */
textarea {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #CCC;
  min-height: 100px;
  margin-bottom: 10px;
}

#message-form {
  margin-top: 18px;
}

/* =============================================================================
Buttons */
button {
  display: inline-block;
  border: none;
  font-size: 12px;
  font-weight: bold;
  padding: 10px 14px;
  color: white;
  margin: 0 4px;
  text-align: center;
  text-transform: uppercase;
}

button.connect {
  background: #81c784;
}

button.disconnect {
  background: #e57373;
}

button.send {
  background: #43a047;
}

button:hover {
  opacity: 0.75;
  cursor: pointer;
}
```

### Code Check

At this point, your client code should look very similar to this:

```javascript
'use strict'; // optional

// Creates a new WebSocket connection, which will fire the open event
let socket = new WebSocket('ws://localhost:3001', 'sample-protocol');

window.onload = function() {
  let messageField = document.getElementById('message-area');
  let messageList = document.getElementById('message-log');
  let socketStatus = document.getElementById('status');

  let closeBtn = document.getElementById('close');
  let openBtn = document.getElementById('open');
  let sendBtn = document.getElementById('send');

  // Set connection status on form to Connected
  socket.onopen = function(event) {
    socketStatus.innerHTML = 'Connected.';
    socketStatus.className = 'open';
  };

  // Listens for incoming messages. When a message is received, the message
  // event is handled by this function
  socket.onmessage = function(event) {
    let message = event.data;
    messageList.innerHTML += '<li class="received"><span>Received: </span>' +
                                message + '</li>';
  };

  // Handles errors. In this case it simply logs them
  socket.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
  };

  // Set connection status on form to Disconnected
  socket.onclose = function(event) {
    socketStatus.innerHTML = 'Disconnected from WebSocket.';
    socketStatus.className = 'closed';
  };

  // Close the WebSocket connection when the Disconnect button is clicked
  closeBtn.onclick = function(event) {
    event.preventDefault();

    socket.close();

    return false;
  };

  // Reload the browser window when the Connect button is clicked
  openBtn.onclick = function(event) {
    window.location.reload(true);
  };

  // Calls the sendMessage function if the send button is clicked
  sendBtn.onclick = function(event) {
    sendMessage();
  };

  // Calls the sendMessage function if the enter key is pressed
  document.querySelector('#message-area').addEventListener('keypress', function(event) {
    event.stopPropagation();
    if(event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();

      sendMessage();

      return false;
    }
  });

  // ==============================================================================
  // Sends message to server
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

```

## Part 3 – Suppressing the Echo

Now let’s add some features that will turn this into a messaging app that is more usable if rather barebones. We’ll be making changes on both the server and client-side. First, we’ll have the server generate a unique ID for each client, which it will then send to the client for it to store for the duration of the session.

Next, we’ll store the message string in a JSON object that will contain additional information such as the message type, the aforementioned client identifier, and a timestamp. Instead of passing a text string back and forth, we’ll be sending a "stringified" JSON object.

Finally, we’ll add a bit of code that will stop the server from echoing a message back to the original sender while still broadcasting it to all other connected clients.

### The Server

Open your **server.js** file and find and **delete** the following lines of code:

```javascript
let count = 0;

let id = count++;
```
This simple sequential ID will be replaced with a server-generated 128-bit integer known as an UUID (or GUID). Add the below functions between `wsServer.on()` and `server.listen()`:

```javascript
// =============================================================================
// UUID generator - not guaranteed to be unique, but good enough for demo purposes
function createUUID() {
  return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

function S4() {
  return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1);
}

//==============================================================================
// Construct clientID object
function createIdObj(id) {
  let initMsg = {
    type: 'id',
    clientKey: id,
    date: Date.now()
  };
  return initMsg;
}
```

Below this line and inside `wsServer.on()`:

```
let connection = req.accept('sample-protocol', req.origin);
```

Add this line:
```javascript
let id = createUUID();
```
This will call the function we defined above that will create a unique client ID. Next, add the below code immediately after: `clients[id] = connection;`

```javascript
let idObj = createIdObj(id);
clients[id].send(JSON.stringify(idObj));
```

These two lines create the JSON that will contain the client ID we generated earlier and transmit it to the client. Next, add the below lines in `connection.on()`, immediately after: `let msgString = message.utf8Data;`

```javascript
let msgObj = JSON.parse(msgString);
let receivedId = msgObj.clientKey;

msgObj.clientKey = '';
msgString = JSON.stringify(msgObj);
```

These four lines parse the JSON string received from the client, save the client key into a variable so the server can reference it later, clear the client key so that it doesn’t get transmitted to the other clients, and changes the JSON back into a string before broadcasting it.

Finally, wrap this line, which is already inside of a **for** loop, in an **if** statement:

`clients[id].sendUTF(msgString);`

Like this:

```javascript
if (id !== receivedId) {
  clients[id].sendUTF(msgString);
}
```

The **if** statement simply tells the server to send the message to all clients *except* the client that originated by comparing that client’s ID to the ID received in the message object.

### Code Check

Your final server code should look like this:

```javascript
'use strict'; // optional

const PORT = process.env.PORT || 3001;

let http = require('http');
let WebSocketServer = require('websocket').server;

let server = http.createServer(function(req, res) {});

let wsServer = new WebSocketServer({
  httpServer: server
});

let clients = {};

// Listens for connection requests, stores the client info, and sends it to client
wsServer.on('request', function(req) {
  let connection = req.accept('sample-protocol', req.origin);
  let id = createUUID();

  clients[id] = connection;

  let idObj = createIdObj(id);

  clients[id].send(JSON.stringify(idObj));

  console.log((new Date()) + ' Connection accepted [' + id + ']');

  // Listens for incoming messages and broadcasts them to all other clients
  connection.on('message', function(message) {
    let msgString = message.utf8Data;
    let msgObj = JSON.parse(msgString);

    let receivedId = msgObj.clientKey;

    // Clear client ID from message before broadcasting to other clients
    msgObj.clientKey = '';

    msgString = JSON.stringify(msgObj);

    for (let id in clients) {
      if (id !== receivedId) {
        clients[id].sendUTF(msgString);
      }
    }
  });

  // Listens for close requests
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
  return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1);
}

// =============================================================================
// Construct clientID object
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
```

## The Client

First, return to your **client.js** file and from within `socket.onmessage`, **delete**:

```
let message = event.data;

messageList.innerHTML += '<li class="received"><span>Received: </span>' + message + '</li>';
```

and from within `sendMessage()`, **remove**:

`socket.send(message);`

Now we have several lines of code to add. Start at the top of the file and immediately below:

`let socket = new WebSocket('ws://localhost:3001', 'sample-protocol');`,

add:

```javascript
let clientKey = '';
```

Next, within `socket.onmessage`, add:

```javascript
let msg = JSON.parse(event.data);

let time = new Date(msg.date);
let timeStr = time.toLocaleTimeString();

// Switch statement to easily add additional functions based on message type
switch(msg.type) {
  case 'id':
    clientKey = msg.clientKey;
    break;
  case 'message':
    messageList.innerHTML += '<li class="received"><span>Received: ' +
           timeStr + '</span>' + msg.text + '</li>';
    break;
}
```
The above displays a timestamp along with our received messages.

Next, within `sendMessage()` and at the beginning of the code within the **if** statement, add:

```javascript
let msg = createMsgObj(message, clientKey);
socket.send(JSON.stringify(msg));
```
This code calls a function that we will add next, which creates the message object and then sends it to the server as JSON.

Finally, at the very end of the file, add these functions, which create the message object that will be sent to the server as well as the message ID:
```javascript
//=============================================================================
// Construct message object
function createMsgObj(message, clientKey) {
  let msg = {
    type: 'message',
    msgId: createMsgId(),
    text: message,
    clientKey: clientKey,
    date: Date.now()
  };
  return msg;
}

//=============================================================================
// Use closure to create and increment counter for message ID
var createMsgId = (function() {
  var counter = 0;
  return function() {
    return counter++;
  };
})();
```

And we’re done!

### Code Check

Your final client code should look like this:

```javascript
'use strict'; // optional

// Creates a new WebSocket connection, which will fire the open connection event
let socket = new WebSocket('ws://localhost:3001', 'sample-protocol');
let clientKey = '';

window.onload = function() {
  let messageField = document.getElementById('message-area');
  let messageList = document.getElementById('message-log');
  let socketStatus = document.getElementById('status');

  let closeBtn = document.getElementById('close');
  let openBtn = document.getElementById('open');
  let sendBtn = document.getElementById('send');

  // Set connection status on form to Connected
  socket.onopen = function(event) {
    socketStatus.innerHTML = 'Connected.';
    socketStatus.className = 'open';
  };

  // Listens for incoming data. When a message is received, the message
  // event is sent to this function
  socket.onmessage = function(event) {
    let msg = JSON.parse(event.data);

    let time = new Date(msg.date);
    let timeStr = time.toLocaleTimeString();

    // Switch statement to easily add additional functions based on message type
    switch(msg.type) {
      case 'id':
        clientKey = msg.clientKey;
        break;
      case 'message':
        messageList.innerHTML += '<li class="received"><span>Received: ' +
          timeStr + '</span>' + msg.text + '</li>';
        break;
    }
  };

  // Handles errors. In this case it simply logs them
  socket.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
  };

  // Set connection status on form to Disconnected
  socket.onclose = function(event) {
    socketStatus.innerHTML = 'Disconnected from WebSocket.';
    socketStatus.className = 'closed';
  };

  // Close the WebSocket connection when the Disconnect button is clicked
  closeBtn.onclick = function(event) {
    event.preventDefault();

    socket.close();

    return false;
  };

  // Reload the browser window when the Connect button is clicked
  openBtn.onclick = function(event) {
    window.location.reload(true);
  };

  // Calls the sendMessage function if the send button is clicked
  sendBtn.onclick = function(event) {
    sendMessage();
  };

  // Calls the sendMessage function if the enter key is pressed
  document.querySelector('#message-area').addEventListener('keypress', function(event) {
    event.stopPropagation();

    if(event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();

      sendMessage();

      return false;
    }
  });

  // =============================================================================
  // Sends message to server
  function sendMessage() {
    let message = messageField.value;

    if (message.length > 0) {
      let msg = createMsgObj(message, clientKey);

      socket.send(JSON.stringify(msg));

      messageList.innerHTML += '<li class="sent"><span>Sent: </span>' +
        message + '</li>';

      messageField.value = '';
      messageField.focus();
    }

    return false;
  }
};

// =============================================================================
// Construct message object
function createMsgObj(message, clientKey) {
  let msg = {
    type: 'message',
    msgId: createMsgId(),
    text: message,
    clientKey: clientKey,
    date: Date.now()
  };

  return msg;
}

// =============================================================================
// Use closure to create and increment counter for message ID
var createMsgId = (function() {
  var counter = 0;
  return function() {
    return counter++;
  };
})();

```

## Conclusion

### Use-Cases

WebSockets provide true bi-directional (or full-duplex) connectivity between a server and one or more clients. The technology greatly reduces the load on servers by eliminating the need for long-polling and HTTP header exchange.

We’ve demonstrated that we can use WebSockets to build a working messaging application, but what are some other use-cases for WebSockets? Does an app:

* require multiple users to communicate with each other? Or...
* provide a window to server-side data that is always changing?

If so, the app is a likely use-case for WebSockets. Here are a few other types of apps that use or could use WebSockets:  

* Multiplayer games  
* Collaborative document or code editing  
* Social feeds  
* Financial and sports tickers  
* Location-based  

### Additional Features

So we have a working chat app, but as I mentioned in the introduction, the functionality is rather basic and it isn’t secure. What features might I add after I graduate and can take the time? Here’s my wish list:

* Use the wss:// prefix (rather than ws://) to establish a WebSocket Secure connection similar to https://
* Enable the use of usernames
* Add user authentication and authorization
* Add an indicator that a message was successfully sent
* Add an indicator that a message was received
* Allow for the sending of files such as photos

Can you think of any others?

## Sources:

https://en.wikipedia.org/wiki/Node.js

https://en.wikipedia.org/wiki/WebSocket

https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers

https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications

**Adapted from** articles by @michaelw90 and Matt West:

http://codular.com/node-web-sockets

http://blog.teamtreehouse.com/an-introduction-to-websockets

## Further Reading / Resources:

https://nodejs.org

https://devcenter.heroku.com/articles/node-websockets

https://www.npmjs.com/package/websocket

http://caniuse.com/#feat=websockets

https://en.wikipedia.org/wiki/Code_injection
