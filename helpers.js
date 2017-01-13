/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */

// =============================================================================
// GUID generator - not guaranteed to be unique, but good enough for demo purposes
function createGUID() {
  return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// =============================================================================
// consruct message object
function createMsgJSON(clientID, message) {
  let msg = {
    type: 'message',
    text: message,
    clientKey: clientID,
    // reqKey: '',
    date: Date.now()
  };

  return msg;
}
