const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');

const CheckoutCartHandler = async function (intentRequest, callback) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const checkoutResult = await handler.handleCheckoutCart(intentRequest);
    let checkoutDesc = '';
    if (checkoutResult['body']['monetary-total']) {
    	const totalPrice = checkoutResult['body']['monetary-total'][0]['display'];
    	checkoutDesc = 'Checkout complete!  Total price is ' + totalPrice;
    } else {
    	checkoutDesc = 'Nothing to checkout.  Cart is empty.'
    }

    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': `${checkoutDesc}`}));
};

module.exports = CheckoutCartHandler;
