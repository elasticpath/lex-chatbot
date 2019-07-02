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
    const reply = await cache.fetch();
    
    // 0. Check if there is a currentResult
    const product = reply.response.curProduct;
    if (!product) {
        return ".. Oh! Well, the product list is empty at the moment. Try searching for something first.";
    } 
    
    // 2. Error handling for response codes.
    if (reply === "" || reply.statusCode === 404) {
         return `Invalid search terms. Please try again.`;
    }
    
    // 2. Assign it's name, description, and price from response
    let productName = product._definition[0]['display-name'];

    let productDesc = product._definition[0].details[0]['display-value'];
    let productPrice;
    if (reply.response.isCart) {
        productPrice = product._price[0]['list-price'][0].display;
    } else {
        productPrice = product._items[0]._element[0]._price[0]['list-price'][0].display;
    }
    // let productPrice = '$12.99'

    let responseString = " ";

    responseString += `${productName} costs ${productPrice}. \n${productDesc}`;
    // responseString += currentUri;
        
    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': `${responseString}`}));
};

module.exports = DescribeProductHandler;