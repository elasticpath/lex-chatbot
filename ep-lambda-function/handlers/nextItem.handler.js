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

// Gather product data for response callback
let productPrice;
let productName;
let productQty;
let productCode;
let button;

// Used to ensure response cards aren't shown at end of list.
let showResponseCard;

const NextItemHandler = async function (intentRequest, callback) {
    showResponseCard = false;
    let sessionAttributes = intentRequest.sessionAttributes;
    
    let lexReply = "";

    const reply = await cache.fetch(intentRequest.sessionAttributes.token);
    
    if (reply === "" || reply.statusCode === 404) {
        lexReply = lexResponses.errorCodes.ERROR_404;
    } else {
        try {
            const currentIndex = reply.response.curProductIndex;
            const count = reply.response.curResponse.length;

            if (currentIndex !== null) {
                const newIndex = currentIndex + 1;
                if (newIndex < count) {
                    showResponseCard = true;
                    const newItem = reply.response.curResponse[newIndex];
                    const currentName = newItem._definition[0]['display-name'];

                    const curResponse = reply.response.curResponse;
                    const curCart = reply.response.isCart;

                    await handler.handleNextItem(intentRequest, curResponse, newItem, newIndex, curCart);

                    // Build response-card based on isCart return
                    if (!curCart) {
                        productName = newItem._definition[0]['display-name'];

                        // Check for price availability
                        if (newItem._items[0]._element[0]._price) {
                            productPrice = newItem._items[0]._element[0]._price[0]['list-price'][0].display;
                        } else {
                            productPrice = "Unavailable";
                        }
                        productCode = newItem._items[0]._element[0]._code[0][`code`];
                        button = lexResponses.generateButton(`Add to cart`, `Add it to my cart`);
                        lexReply = `Okay! Item number ${newIndex + 1} is: ${JSON.stringify(currentName)}.`;
                    } else {
                        const cartItem = await handler.handleGetCartItem(newIndex);
                        productName = cartItem['body']._item[0]._definition[0]['display-name'];
                        productQty = cartItem['body']['quantity'];
                        productPrice = cartItem['body']._item[0]._price[0]['list-price'][0].display + ` - Qty: ${productQty}`;
                        productCode = cartItem['body']._item[0]._code[0][`code`];
                        button = lexResponses.generateButton(`Remove from cart`, `Remove this from my cart`);
                        lexReply = `Okay! Item number ${newIndex + 1} is: ${JSON.stringify(currentName)}. You have ${productQty} of them.`;
                    }
                } else {
                    lexReply = lexResponses.list.END_OF_LIST;
                }
            } else {
                lexReply = lexResponses.generalResponse.EMPTY_LIST;
            }
        } catch(e) {
            console.error(e);
            lexReply = lexResponses.generalResponse.EXPIRED_SESSION;
        }
    }

    // Return response card if SKU_IMAGE_URL is provided. Otherwise, return plaintext.
    if (process.env.SKU_IMAGES_URL && showResponseCard) {
        // Case that an image URL was provided.
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
        // Case that an image URL is not provided
        callback(
            lexResponses.close(
                sessionAttributes, 
                'Fulfilled',
                {"contentType": "PlainText", "content": lexReply}
            )
        );
    }
};

module.exports = NextItemHandler;
