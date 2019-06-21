const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');
const cache = require('../dynamoCache');

// async function removeFromCart (intentRequest) {
//     console.log("FROM REMOVE CART");
//     const response = await handler.handleRemoveFromCart(intentRequest.currentIntent.slots.code);

//     return JSON.stringify(response);
// }

const RemoveFromCartHandler = async function (intentRequest, callback) {
    let sessionAttributes = intentRequest.sessionAttributes;
    let lexReply = "";

    const reply = await cache.fetch();

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
            lexReply = "Something went wrong. Please try again";
        }
    }

    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': lexReply}));
};

module.exports = RemoveFromCartHandler;
