// Lex fulfillment functions
module.exports.close = function (sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        "dialogAction": {
            "type": 'Close',
            fulfillmentState,
            message,
        },
    };
}
// Auth and Invocation messages
module.exports.epAuth = {
    WELCOME: `Welcome to EP! How may I assist?`,
    GREETINGS: `Hello again!`,
    REQUIRE_TOKEN: `Please initialize the chatbot with command "hello ep"`,
    REGISTERED: `REGISTERED`,
    PUBLIC: `PUBLIC`
};

// List transition messages
module.exports.list = {
    END_OF_LIST: `We're at the end of the list.`,
    START_OF_LIST: `We're at the start of the list.`
};

// General Response Messages
module.exports.generalResponse = {
    EXPIRED_SESSION: `Unable to perform task. Your session may have expired.`,
    INVALID_SEARCH: `Invalid search terms. Please try again.`,
    NO_RESULTS: `No results found using those search terms.`,
    EMPTY_CART: `Your cart is currently empty.`,
    EMPTY_LIST: `The product list is empty at the moment. Try searching for something first.`,
    ITEM_UNAVAILABLE: `This product is currently unavailable.`,
    PUBLIC_SERVICE: `This service is unavailable to public users. Please register an account at vestri.com`
};

// Error code messages
module.exports.errorCodes = {
    ERROR_404: `This service is currently unavailable.`,
    ERROR_401: `The bearer token was rejected: Missing Roles.`
};