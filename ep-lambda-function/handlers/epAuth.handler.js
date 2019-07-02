const lexResponses = require('../lexResponses');
const cortex = require("../cortex");
const cortexInstance = cortex.getCortexInstance();
const { ElasticPathIntents } = require('../constants');

// This Intent is responsible for handling initial token tracking and authentication.
const EPAuthHandler = async function (intentRequest, callback) {
    // 1. Gather resources from intentRequest
    let sessionAttributes = intentRequest.sessionAttributes || {};
    let slots = intentRequest.currentIntent.slots;
    let callingIntent = intentRequest.currentIntent.name;
    let lexReply = "";
    
    // 2. Check to see if and how the token will be supplied.
    if (callingIntent !== ElasticPathIntents.EP_AUTH) {
        // Another intent was called before a token was aquired
        // NOTE - The sessionAttribute check in index.js is the only way this check would be true.
        lexReply = "Please initialize the chatbot with command \"hello ep\"";
    } else if (sessionAttributes.token) {
        // Already has a token
        lexReply = `Hello again!`;
    } else if (slots.token) {
        // Supplied a client-token
        sessionAttributes.token = slots.token;
        cortexInstance.token = sessionAttributes.token;
        lexReply = `Token received and set to ${sessionAttributes.token}`;
    } else {
        // Given a default token
        cortexInstance.token = "";
        if (!cortexInstance.token) {
            cortexInstance.token = await cortexInstance.requestToken();
        }
        sessionAttributes.token = cortexInstance.token;
        lexReply = `Welcome to EP! How may I assist?`;
    }
    
    // 3. Send confirmation with relevant case message.
    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': lexReply}));
};

module.exports = EPAuthHandler;