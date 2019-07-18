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
        let lexReply;
        let product;

        // Check to see if cache returns a response.
        if (reply.response && !reply.response.isCart) {
            product = reply.response.curProduct;
            // Get current item in cache
            const currentCode = product['_items'][0]['_element'][0]['_code'][0]['code'];
            const displayName = product._definition[0]['display-name'];
            const amount = intentRequest.currentIntent.slots.amount;

            // Check to see if the item is available
            if (product._items[0]._element[0]._price) {
                await handler.handleAddtoCart(currentCode, amount);
                lexReply = `I've added ${amount} of "${displayName}" to your cart.`;
            } else {
                lexReply = lexResponses.generalResponse.ITEM_UNAVAILABLE;
            }
        } else if(reply.response && reply.response.isCart) {
            lexReply = lexResponses.generalResponse.NOT_IN_LIST;
        } else {
            // Inform that the session data may have expired
            lexReply = lexResponses.generalResponse.EXPIRED_SESSION;
        }
    
        callback(
            lexResponses.close(
                sessionAttributes,
                'Fulfilled',
                {"contentType": "PlainText", "content": lexReply}
            )
        );
};

module.exports = AddToCartHandler;
