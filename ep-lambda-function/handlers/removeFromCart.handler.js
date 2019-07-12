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

const RemoveFromCartHandler = async function (intentRequest, callback) {
    let sessionAttributes = intentRequest.sessionAttributes;
    let lexReply = "";

    const reply = await cache.fetch(intentRequest.sessionAttributes.token);

    if (!reply || reply.statusCode === 404) {
        lexReply = lexResponses.errorCodes.ERROR_404;
    } else if (!reply.response.isCart) {
        lexReply = lexResponses.generalResponse.NOT_IN_CART;
    } else {
        try {
            let sku = reply.response.curProduct['_code'][0]['code'];
            var productName = reply.response.curProduct._definition[0]['display-name'];
            await handler.handleRemoveFromCart(sku);
            lexReply = `${productName} has been removed from your cart`;
            await handler.handleGetCart(intentRequest);
        } catch(e) {
            lexReply = lexResponses.generalResponse.EXPIRED_SESSION;
        }
    }

    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': lexReply}));
};

module.exports = RemoveFromCartHandler;
