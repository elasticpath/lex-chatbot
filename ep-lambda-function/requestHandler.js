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

const cortex = require("./cortex");
const cortexInstance = cortex.getCortexInstance();
const cache = require("./dynamoCache");
// Determines if items in cache is a cart list or search results list

async function handleSearchByKeyword(event) {
    try {
        // console.log(`In keywordSearchHandler: ${cortexInstance.token}`);
        let result = await cortexInstance.getItemsByKeyword(event.currentIntent.slots.searchKeyword);
        
        const cacheEntry = {
            curResponse: JSON.stringify(result),
            curProduct: JSON.stringify(result[0]),
            curProductIndex: 0,
            isCart: false
        }
        await cache.put(cacheEntry, event.sessionAttributes.token);
        const response = {
            statusCode: 200,
            body: result
        };
        return response;
    } catch(e) {
        const response = {
            statusCode: 404,
            body: "Couldn't get items from Cortex"
        }
        return response;
    }
}

async function handleNextItem(event, curResponse, newProduct, newIndex, curCart) {
    try {
        const cacheEntry = {
            curResponse: JSON.stringify(curResponse),
            curProduct: JSON.stringify(newProduct),
            curProductIndex: newIndex,
            isCart: curCart
        };

        await cache.put(cacheEntry, event.sessionAttributes.token);
        const response = {
            statusCode: 200,
            body: "Successfully incremented to next index."
        };
        return response;
    } catch(e) {
        const response = {
            statusCode: 404,
            body: "Couldn't increment index."
        }
        return response;
    }
}

async function handlePrevItem(event, curResponse, newProduct, newIndex, curCart) {
    try {
        const cacheEntry = {
            curResponse: JSON.stringify(curResponse),
            curProduct: JSON.stringify(newProduct),
            curProductIndex: newIndex,
            isCart: curCart
        };
        await cache.put(cacheEntry, event.sessionAttributes.token);
        const response = {
            statusCode: 200,
            body: "Successfully decremented to previous index."
        };
        return response;
    } catch(e) {
        const response = {
            statusCode: 404,
            body: "Couldn't decrement index."
        }
        console.error(e);
        return response;
    }
}

async function handleDescribeProduct(sku) {
    try {
        let result = await cortexInstance.cortexGetItemBySku(sku);
        const response = {
            statusCode: 200,
            body: result
        };
        return response;
    } catch(e) {
        console.error(e);
        const response = {
            statusCode: 404,
            body: e
        }
    }
}

async function handleAddtoCart(currentCode, amount) {
    try {
        let result = await cortexInstance.cortexAddToCart(currentCode, amount);
        const response = {
            statusCode: 200,
            body: "Successfully added to cart."
        };
        return response
    } catch(e) {
        const response = {
            statusCode: 404,
            body: e
        }
        return response;
    }
    
}
async function handleGetCart(event) {
    try {
        let result = await cortexInstance.getCartItems();
        const defaultCart = result['_defaultcart'][0];

        // only add cart items to cache if cart is not empty
        if (defaultCart['_lineitems']) {
            const arrCartItems = defaultCart['_lineitems'][0]['_element'].map((ele) => {
                return ele['_item'][0];
            });
            
            const cacheEntry = {
                curResponse: JSON.stringify(arrCartItems),
                curProduct: JSON.stringify(arrCartItems[0]),
                curProductIndex: 0,
                isCart: true
            }
            await cache.put(cacheEntry, event.sessionAttributes.token);
        }
        
        const response = {
            statusCode: 200,
            body: result
        };
        return response;
    } catch(e) {
        console.error(e);
        const response = {
            statusCode: 404,
            body: e
        }
        return response;
    }
}

async function handleRemoveFromCart(sku) {
    try {
        let result = await cortexInstance.cortexDeleteFromCart(sku);
        const response = {
            statusCode: 200,
            body: result
        };
        return response
    } catch(e) {
        console.error(e);
        const response = {
            statusCode: 404,
            body: e
        }
        return response;
    }
}

async function handleCheckoutCart(event) {
    try {
        let result = await cortexInstance.cortexCheckout();
        const response = {
            statusCode: 200,
            body: result
        };
        return response;
    } catch(e) {
        console.error(e);
        const response = {
            statusCode: 404,
            body: e
        };
        return response;
    }
}


module.exports.handleAddtoCart = handleAddtoCart;
module.exports.handleCheckoutCart = handleCheckoutCart;
module.exports.handleDescribeProduct = handleDescribeProduct;
module.exports.handleGetCart = handleGetCart;
module.exports.handleNextItem = handleNextItem;
module.exports.handlePrevItem = handlePrevItem;
module.exports.handleRemoveFromCart = handleRemoveFromCart;
module.exports.handleSearchByKeyword = handleSearchByKeyword;