const cortex = require("./cortex");
const cortexInstance = cortex.getCortexInstance();
const cache = require("./dynamoCache");
// Determines if items in cache is a cart list or search results list
let isCart;

async function handleSearchByKeyword(event) {
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
    try {
        let result = await cortexInstance.getItemsByKeyword(event.currentIntent.slots.searchKeyword);
        console.log("In request hander.js");
        console.log(JSON.stringify(result));
        const cacheEntry = {
            curResponse: JSON.stringify(result),
            curProduct: JSON.stringify(result[0]),
            curProductIndex: 0,
            isCart: false
        }
        await cache.put(cacheEntry);
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
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
    try {
        const cacheEntry = {
            curResponse: JSON.stringify(curResponse),
            curProduct: JSON.stringify(newProduct),
            curProductIndex: newIndex,
            isCart: curCart
        };

        await cache.put(cacheEntry);
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
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
    try {
        const cacheEntry = {
            curResponse: JSON.stringify(curResponse),
            curProduct: JSON.stringify(newProduct),
            curProductIndex: newIndex,
            isCart: curCart
        };
        await cache.put(cacheEntry);
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
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
    
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
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
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
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
    try {
        let result = await cortexInstance.getCartItems();
        const defaultCart = result['_defaultcart'][0];

        //only add cart items to cache if cart is not empty
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
            await cache.put(cacheEntry);
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
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
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
    if (!cortexInstance.token) {
        cortexInstance.token = await cortexInstance.requestToken();
    }
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