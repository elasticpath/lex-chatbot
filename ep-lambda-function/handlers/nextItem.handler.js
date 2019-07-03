const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');
const cache = require('../dynamoCache');

const NextItemHandler = async function (intentRequest, callback) {
        let sessionAttributes = intentRequest.sessionAttributes;
        
        let lexReply = "";

        const reply = await cache.fetch(intentRequest.sessionAttributes.token);
        
        if (reply === "" || reply.statusCode === 404) {
            lexReply = `Something went wrong. Couldn't find next item.`;
        } else {
            try {
                const currentIndex = reply.response.curProductIndex;
                const count = reply.response.curResponse.length;

                if (currentIndex !== null) {
                    const newIndex = currentIndex + 1;
                    if (newIndex < count) {
                        const newItem = reply.response.curResponse[newIndex];
                        const currentName = newItem._definition[0]['display-name'];

                        // const first = newItem._definition[0]['display-name'];

                        const curResponse = reply.response.curResponse;
                        const curCart = reply.response.isCart;

                        await handler.handleNextItem(intentRequest, curResponse, newItem, newIndex, curCart);

                        lexReply = `Okay! Item number ${newIndex + 1} is:` + " " + `${JSON.stringify(currentName)}`;
                    } else {
                        lexReply = 'Cannot go next anymore.';
                    }
                } else {
                    lexReply = `Something went wrong. Try searching for product again.`;
                }
            } catch(e) {
                console.error(e);
                lexReply = `Couldn't find the next item. Your session may have expired.`;
            }
        }

        callback(
            lexResponses.close(
                sessionAttributes, 
                'Fulfilled',
                {"contentType": "PlainText", "content": lexReply}
            )
        );
};

module.exports = NextItemHandler;