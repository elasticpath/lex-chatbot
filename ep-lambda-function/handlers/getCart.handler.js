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

async function getCartTotal (intentRequest) {
    const response = await handler.handleGetCart(intentRequest);
    
    // Error handling for 401 - missing roles
    if (response[`body`][`statusCode`] === 401) {
        return lexResponses.errorCodes.ERROR_401;
    }
    
    const totalQuant = response['body']['_defaultcart'][0]['total-quantity'];
    
    if (totalQuant === 0) {
        return lexResponses.generalResponse.EMPTY_CART;
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
