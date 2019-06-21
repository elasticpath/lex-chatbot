const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');
const cache = require('../dynamoCache');

const AddToCartHandler = async function (intentRequest, callback) {
        const sessionAttributes = intentRequest.sessionAttributes;
        const reply = await cache.fetch();
        //get current item in cache to add to cart
        const currentCode = reply.response.curProduct['_items'][0]['_element'][0]['_code'][0]['code'];
        const displayName = reply.response.curProduct._definition[0]['display-name'];

        const slots = intentRequest.currentIntent.slots;
        const amount = slots.amount;

        const addToCartRes = await handler.handleAddtoCart(currentCode, amount);
        

        // Add a message if the add fails.
    
        callback(
            lexResponses.close(
                sessionAttributes, 
                'Fulfilled',
                {"contentType": "PlainText", "content": `I\'ve added ${amount} of \"${displayName}\" to your cart.`}
            )
        );
};

module.exports = AddToCartHandler;