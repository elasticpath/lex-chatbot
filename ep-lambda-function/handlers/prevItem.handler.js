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
let productName = "";
let productCode = 20005;
let button;

const PrevItemHandler = async function (intentRequest, callback) {
        let sessionAttributes = intentRequest.sessionAttributes;

        let lexReply = "";

        const reply = await cache.fetch(intentRequest.sessionAttributes.token);
        
        if (reply === "" || reply.statusCode === 404) {
            lexReply = lexResponses.errorCodes.ERROR_404;
        } else {
            try {
                const currentIndex = reply.response.curProductIndex;

                if (currentIndex !== null) {
                    const newIndex = currentIndex - 1;
                    if (newIndex >= 0) {
                        const newItem = reply.response.curResponse[newIndex];
                        const currentName = newItem._definition[0]['display-name'];

                        const curResponse = reply.response.curResponse;
                        const curCart = reply.response.isCart;

                        await handler.handlePrevItem(intentRequest, curResponse, newItem, newIndex, curCart);

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
                        } else {
                            productName = newItem._definition[0]['display-name'];
                            productPrice = newItem._price[0]['list-price'][0].display;
                            productCode = newItem._code[0][`code`];
                            button = lexResponses.generateButton(`Remove from cart`, `Remove this from my cart`);
                        }

                        lexReply = `Okay! Item number ${newIndex + 1} is:` + " " + `${JSON.stringify(currentName)}`;
                    } else {
                        lexReply = lexResponses.list.START_OF_LIST;
                    }
                } else {
                    lexReply = lexResponses.generalResponse.EMPTY_LIST;
                }
            } catch(e) {
                console.log(e);
                lexReply = lexResponses.generalResponse.EXPIRED_SESSION;
            }
        }

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

module.exports = PrevItemHandler;
