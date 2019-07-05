/**
 * Copyright © 2018 Elastic Path Software Inc. All rights reserved.
 *
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this license. If not, see
 *
 *     https://www.gnu.org/licenses/
 *
 *
 */

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
            
            lexResponse = `I've added ${amount} of "${displayName}" to your cart.`;
        } else {
            // Inform that the session data may have expired
            lexResponse = lexResponses.generalResponse.EXPIRED_SESSION;
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