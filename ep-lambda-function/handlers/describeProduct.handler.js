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

async function getReply(currentCode) {
    if (currentCode !== null && currentCode !== "") {
        const product = await handler.handleDescribeProduct(currentCode);
        return product;
    }
    return "";
}

const DescribeProductHandler = async function (intentRequest, callback) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const reply = await cache.fetch(intentRequest.sessionAttributes.token);
    let lexResponse = "";
    let product;
    
    // 1. Check to see if there is a response from the cache
    if (reply.response) {
        // 2. Check if there is a currentResult
        product = reply.response.curProduct;
        if (!product) {
            return lexResponses.generalResponse.EMPTY_LIST;
        } 
        
        // 3. Error handling for response codes.
        if (reply === "" || reply.statusCode === 404) {
             return lexResponses.generalResponse.INVALID_SEARCH;
        }
        
        // 5. Assign it's name, description, and price from response
        let productName = product._definition[0]['display-name'];
    
        let productDesc = product._definition[0].details[0]['display-value'];
        let productPrice;

        // 6. Check if we are describing in cart, or in product list.
        if (reply.response.isCart) {
            productPrice = product._price[0]['list-price'][0].display;
            lexResponse = `${productName} costs ${productPrice}. \n${productDesc}`;
        } else {
            // Check if pricing is available.
            if (product._items[0]._element[0]._price) {
                productPrice = product._items[0]._element[0]._price[0]['list-price'][0].display;
                lexResponse = `${productName} costs ${productPrice}. \n${productDesc}`;
            } else {
                lexResponse = `${productName}'s price is currently unavailable. \n${productDesc}`;
            }
        }
    } else {
        lexResponse = lexResponses.generalResponse.EMPTY_LIST;
    }
    
    callback(lexResponses.close(sessionAttributes,
        'Fulfilled',
        {
            'contentType': 'PlainText',
            'content': `${lexResponse}`
            
        }));
};

module.exports = DescribeProductHandler;