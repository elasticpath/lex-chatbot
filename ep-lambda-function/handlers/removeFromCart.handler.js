const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');
const cache = require('../dynamoCache');

const RemoveFromCartHandler = async function (intentRequest, callback) {
    let sessionAttributes = intentRequest.sessionAttributes;
    let lexReply = "";

    const reply = await cache.fetch(intentRequest.sessionAttributes.token);

    if (!reply || reply.statusCode === 404) {
        lexReply = `Item couldn't be removed from cart. Please try again`;
    } else {
        try {
            let sku = reply.response.curProduct['_code'][0]['code'];
            var productName = reply.response.curProduct._definition[0]['display-name'];
            await handler.handleRemoveFromCart(sku);
            lexReply = `${productName} has been removed from your cart`;
            await handler.handleGetCart(intentRequest);
        } catch(e) {
            lexReply = "Cannot remove from cart. Your session may have expired.";
        }
    }

    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': lexReply}));
};

module.exports = RemoveFromCartHandler;
