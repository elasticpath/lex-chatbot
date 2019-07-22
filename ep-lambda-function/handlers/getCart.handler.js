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
let productPrice;
let productName;
let productQty;
let productCode;
let totalQuant;
let button;

// Used to ensure response cards aren't shown if list is empty.
let showResponseCard;

// Builds and returns the relevant Lex Reply based on the state of the cart.
async function getCartMessage (intentRequest) {
    showResponseCard = false;
    const response = await handler.handleGetCart(intentRequest);
    const firstItem = await handler.handleGetCartItem(0);

    // Error handling for 401 - missing roles
    if (response[`body`][`statusCode`] === 401) {
        return lexResponses.errorCodes.ERROR_401;
    } else {
        try {
            totalQuant = response['body']['_defaultcart'][0]['total-quantity'];
            if (totalQuant === 0) {
                return lexResponses.generalResponse.EMPTY_CART;
            }

            const count = response['body']['_defaultcart'][0]['_lineitems'][0]['_element'].length;
            const totalPrice = response['body']['_defaultcart'][0]['_total'][0]['cost'][0]['display'];
            product = response['body']['_defaultcart'][0]['_lineitems'][0]['_element'][0]['_item'][0];

            // Variables to display response card:
            productName = product._definition[0]['display-name'];
            productQty = firstItem['body']['quantity'];
            productPrice = product._price[0]['list-price'][0].display  + ` - Qty: ${productQty}`;
            productCode = product._code[0][`code`];
            button = lexResponses.generateButton(`Remove from cart`, `Remove this from my cart`);
            showResponseCard = true;
            return `You have ${count} items in cart. Total cost is: ${totalPrice}. The first item is ${productName}. You have ${productQty} of them.`;
        } catch(e) {
            console.error(e);
            return lexResponses.generalResponse.EXPIRED_SESSION;
        } 
    }
}

const GetCartHandler = async function (intentRequest, callback, sessionCart) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const lexReply = await getCartMessage(intentRequest);
    
    // Return response card if it is required. Otherwise, return plaintext.
    if (process.env.SKU_IMAGES_URL && showResponseCard) {
        // Case that a response card should be displayed
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
    } else {
        // Case that a plaintext response should be displayed.
        callback(
            lexResponses.close(
                sessionAttributes, 
                'Fulfilled',
                {"contentType": "PlainText", "content": lexReply}
            )
        );
    }
};

module.exports = GetCartHandler;
