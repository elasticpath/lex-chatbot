const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');
const cache = require('../dynamoCache');

const AddToCartHandler = async function (intentRequest, callback) {
        const sessionAttributes = intentRequest.sessionAttributes;
        const reply = await cache.fetch(intentRequest.sessionAttributes.token);
        let lexResponse = "";
        
        // Check to see if cache returns a response.
        if (reply.response) {
            // get current item in cache to add to cart
            const currentCode = reply.response.curProduct['_items'][0]['_element'][0]['_code'][0]['code'];
            const displayName = reply.response.curProduct._definition[0]['display-name'];
    
            const amount = intentRequest.currentIntent.slots.amount;
            await handler.handleAddtoCart(currentCode, amount);
            
            lexResponse = `I\'ve added ${amount} of \"${displayName}\" to your cart.`;
        } else {
            // Inform that the session data may have expired
            lexResponse = `Unable to add to cart. Your session may have expired.`
        }
    
        callback(
            lexResponses.close(
                sessionAttributes, 
                'Fulfilled',
                {"contentType": "PlainText", "content": lexResponse}
            )
        );
};

module.exports = AddToCartHandler;