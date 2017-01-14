/* jshint esversion: 6 */
/* jshint devel: true */
/* jshint node: true */
/* jshint browser: true */
/* jshint mocha: true */

// =============================================================================
// consruct message object
function createMsgObj(message, clientKey) {
  let msg = {
    type: 'message',
    text: message,
    clientKey: clientKey,
    date: Date.now()
  };

  return msg;
}
