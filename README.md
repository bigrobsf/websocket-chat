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

* npm install websocket
* npm install nodemon

Nodemon is a package that will automate restarting your server after each edit. If you haven't used it before, you'll appreciate it!

## Technology

**Node.js** is an open-source, cross-platform JavaScript runtime environment for developing tools and applications. It uses the Google V8 engine (built for Google Chrome) to interpret JavaScript. Node.js has an event-driven architecture that is non-blocking and supports asynchronous input/output. It seeks to optimize throughput and scalability, which makes it ideal for building web servers and real-time web applications such as chat apps and browser games.

**WebSockets** is an API introduced with the HTML5 specification. The technology allows for a continuous bi-directional connection between a client and server. This makes it ideal for messaging / chat applications. The client is usually a user’s browser and thus the client-side is implemented using HTML and JavaScript. The server, however, can be implemented on any number of platforms though in this tutorial we will build the server using JavaScript and Node.js.

## Tutorial

**Introduction - Why WebSockets?:** For many years, the web’s communication paradigm was that a client, usually via a web browser, requested data from a server. The server then responded to those requests. As the years passed, web applications matured, became more powerful and complex, and consumed increasing amounts of data. However, the existing HTTP model of client-initiated communication limited their usefulness and usability. Several work-arounds were developed, one of the most popular of which was long-polling.

Long-polling involves keeping an HTTP connection open until the server has data it can push to the client. However, this and other solutions carried the overhead that comes with HTTP. Each HTTP request requires that request headers and cookie data be transferred to the server, which increases latency (increases the time it takes for the server to respond). What was needed was a way of creating a persistent, low latency connection that could support transactions initiated by *either* the client or server.

The WebSockets protocol meets this requirement by establishing a persistent socket connection between the client and server. Once the connection is created, it will remain open until the client or server wants to close it. This significantly reduces the burden on the server and is well-suited for low latency applications. In this tutorial, you are going to learn how to use WebSockets to build a messaging app, which will hopefully help you use this awesome protocol in your own applications. But first, a high-level overview of how the WebSockets protocol works…

A client establishes a WebSocket connection with a server through a process known as *the WebSocket handshake*. First, the client sends a regular HTTP request to the server. An Upgrade header is included in this request that informs the server that the client wishes to establish a WebSocket connection. If the server supports the WebSocket protocol, it grants the upgrade and sends an Upgrade header in its response.

Once the handshake is complete, the original HTTP connection is changed to a WebSocket connection that uses the same underlying TCP/IP connection. Data can now be sent in either direction over the connection.

Now that you have a bit of background, let’s make this happen! For this tutorial (assuming you already have a JavaScript development environment set up on your computer) you'll just need access to somewhere that has Node.js installed along with its URL or IP address. Conveniently, this can even be your own computer.

**Part 1 - The Server:** this section will include instructions on how to implement a simple Node.js websocket server. It will also include the code along with explanations.

**Part 2 - The Client:** this section will include instructions on how to implement a chat client that will request a socket connection to the server. It will also include the code along with explanations.

**Part 3 - Suppressing the ‘Echo’:** this section will explain how to suppress the message ‘echo’ that returns from the server to the client that sent the message. It will also include the necessary code.

**Conclusion:** I’ll think about this as I write, but I do plan to identify potential features that could be added such as user authentication, authorization, usernames, sending photos, or message sent and received acknowledgments.

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
