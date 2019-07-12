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

// Gather product data for response callback
let product;
let productName;
let productPrice;
let productCode;
let button;

// Builds and returns the relevant Lex Reply based on the state of the cart.
async function getCartTotal (intentRequest) {
    const response = await handler.handleGetCart(intentRequest);

    // Error handling for 401 - missing roles
    if (response[`body`][`statusCode`] === 401) {
        return lexResponses.errorCodes.ERROR_401;
    } else {
        try {
            console.log(`Checking cart quantity`);
            const totalQuant = response['body']['_defaultcart'][0]['total-quantity'];
            if (totalQuant === 0) {
                return lexResponses.generalResponse.EMPTY_CART;
            }

            const totalPrice = response['body']['_defaultcart'][0]['_total'][0]['cost'][0]['display'];
            product = response['body']['_defaultcart'][0]['_lineitems'][0]['_element'][0]['_item'][0];

            // Variables to display response card:
            productName = product._definition[0]['display-name'];
            productPrice = product._price[0]['list-price'][0].display;
            productCode = product._code[0][`code`];
            button = lexResponses.generateButton(`Remove from cart`, `Remove this from my cart`);
        
            return `You have ${totalQuant} items in cart. Total cost is: ${totalPrice}. The first item is ${productName}`;
        } catch(e) {
            console.error(e);
            return lexResponses.generalResponse.EXPIRED_SESSION;
        } 
    }
}

const GetCartHandler = async function (intentRequest, callback, sessionCart) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const lexReply = await getCartTotal(intentRequest);
    
    callback(lexResponses.closeResponse(
        sessionAttributes,
        'Fulfilled',
        { 'contentType': 'PlainText', 'content': `${lexReply}` },
        productName,
        productPrice,
        process.env.SKU_IMAGES_URL+`${productCode}.png`,
        [
            button
        ]
    ));
};

module.exports = GetCartHandler;
