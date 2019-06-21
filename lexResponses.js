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
