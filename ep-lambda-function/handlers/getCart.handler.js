const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');

async function getCartTotal (intentRequest) {
    const response = await handler.handleGetCart(intentRequest);
    const totalQuant = response['body']['_defaultcart'][0]['total-quantity'];
    
    if (totalQuant === 0) {
        return 'Cart is empty';
    }
    const totalPrice = response['body']['_defaultcart'][0]['_total'][0]['cost'][0]['display'];
    const firstItem = response['body']['_defaultcart'][0]['_lineitems'][0]['_element'][0]['_item'][0]['_definition'][0]['display-name'];

    return 'You have ' + totalQuant + " items in cart.  Total cost is: " + totalPrice + ". The first item is " + firstItem;
}

const GetCartHandler = async function (intentRequest, callback, sessionCart) {
    const sessionAttributes = intentRequest.sessionAttributes;

    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': `${await getCartTotal(intentRequest)}`}));
};

module.exports = GetCartHandler;
