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

    let showResponseCard = false;
    let lexReply = "";

    // Gather product data for response callback
    let productPrice;
    let productName;
    let productQty;
    let productCode;
    let button;

    const reply = await cache.fetch(intentRequest.sessionAttributes.token);

    // Ensure reply is not undefined before removing.
    if (!reply) {
        lexReply = lexResponses.generalResponse.EXPIRED_SESSION;
    } else if (reply && reply.statusCode === 404) {
        lexReply = lexResponses.errorCodes.ERROR_404;
    } else if (reply && !reply.response.isCart) {
        lexReply = lexResponses.generalResponse.NOT_IN_CART;
    } else {
        try {
            // Get sku info number from current cart product
            let curIndex = reply.response.curProductIndex;
            let sku = reply.response.curProduct['_code'][0]['code'];
            let productName = reply.response.curProduct._definition[0]['display-name'];
            let currentCart = await handler.handleGetCart(intentRequest);

            // If cart is empty, cannot remove. Else, remove by sku and confirm.
            if (currentCart['body']['_defaultcart'][0]['total-quantity'] <= 0) {
                lexReply = lexResponses.generalResponse.EMPTY_CART;
            } else {
                // Prepare response card with new current item.
                showResponseCard = true;

                // 1. Get current cart item and save it's name before removal
                let cartItem = await handler.handleGetCartItem(curIndex);
                let removedName = cartItem['body']._item[0]._definition[0]['display-name'];

                // 2. Remove the item.
                await handler.handleRemoveFromCart(sku);

                // 3. Get the updated cart for the cache.
                currentCart = await handler.handleGetCart(intentRequest);

                // 4. Check if cart is now empty
                if (currentCart['body']['_defaultcart'][0]['total-quantity'] <= 0) {
                    lexReply = `${removedName} has been removed from your cart. Your cart is now empty.`;
                } else {
                    // 5. If cart isn't empty, get the new item replaced and display.
                    cartItem = await handler.handleGetCartItem(0);
                    productName = cartItem['body']._item[0]._definition[0]['display-name'];
                    productQty = cartItem['body']['quantity'];
                    productPrice = cartItem['body']._item[0]._price[0]['list-price'][0].display + ` - Qty: ${productQty}`;
                    productCode = cartItem['body']._item[0]._code[0][`code`];
                    button = lexResponses.generateButton(`Remove from cart`, `Remove this from my cart`);
    
                    lexReply = `${removedName} has been removed from your cart. You are now viewing ${productName}.`;
                }
            }
        } catch(e) {
            lexReply = lexResponses.generalResponse.EXPIRED_SESSION;
        }
    }

    // Return response card if SKU_IMAGE_URL is provided. Otherwise, return plaintext.
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

module.exports = RemoveFromCartHandler;
