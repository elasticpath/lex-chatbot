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
let productCode;
let button;

// Used to ensure response cards aren't shown if list is empty.
let showResponseCard;

async function getReply(intentRequest) {
    const searchKeyword = intentRequest.currentIntent.slots.searchKeyword;
    
    if (searchKeyword !== null && searchKeyword !== "") {
            const response = await handler.handleSearchByKeyword(intentRequest);
            return response;
    }
    
    return `Invalid search terms. Please try again.`;
}

const KeywordSearchHandler = async function (intentRequest, callback) {
    showResponseCard = false;
    const slots = intentRequest.currentIntent.slots;
    const searchKeyword = slots.searchKeyword;
    
    let sessionAttributes = intentRequest.sessionAttributes;
    
    await getReply(intentRequest);
    let lexReply;
    
    const reply = await cache.fetch(intentRequest.sessionAttributes.token);
    
    // Check standard error codes
    if (reply === "" || reply.statusCode === 401) {
        lexReply = lexResponses.errorCodes.ERROR_401;
    } else if (reply === "" || reply.statusCode === 404) {
        lexReply = lexResponses.generalResponse.INVALID_SEARCH;
    } else if (reply === "" || reply.statusCode === 400) {
        lexReply = lexResponses.generalResponse.NO_RESULTS;
    } else {
        try {
            let product = reply.response.curProduct;
            const count = reply.response.curResponse.length;
            
            // Variables to display response card
            productName = product._definition[0]['display-name'];
            productPrice = product._items[0]._element[0]._price[0]['list-price'][0].display;
            productCode = product._items[0]._element[0]._code[0][`code`];
            button = lexResponses.generateButton(`Add to cart`, `Add it to my cart`);

            const resultText = count > 1 ? 'results' : 'result';
            lexReply = `Okay. I found ${count} ${resultText} for ${searchKeyword}. The first result is:` + " " + `${JSON.stringify(productName)}`;
            showResponseCard = true;
        } catch(e) {
            console.error(e);
            lexReply = lexResponses.generalResponse.NO_RESULTS;
        }
    }

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

module.exports = KeywordSearchHandler;
