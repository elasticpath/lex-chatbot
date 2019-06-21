const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');
const cache = require('../dynamoCache');

async function getReply(intentRequest) {

    if (searchKeyword !== null && searchKeyword !== "") {
            const response = await handler.handleSearchByKeyword(intentRequest);
            return response;
    }
    
    return `Invalid search terms. Please try again.`;
}

const PrevItemHandler = async function (intentRequest, callback) {
        let sessionAttributes = intentRequest.sessionAttributes;
        let lexReply = "";
        const reply = await cache.fetch();
        
        if (reply === "" || reply.statusCode === 404) {
            lexReply = `Something went wrong. Couldn't find previous item.`;
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

                        lexReply = `Okay! Item number ${newIndex + 1} is:` + " " + `${JSON.stringify(currentName)}`;
                    } else {
                        lexReply = 'Cannot go previous anymore.';
                    }
                } else {
                    lexReply = `Something went wrong. Try searching for product again.`;
                }
            } catch(e) {
                console.log(e);
                lexReply = `Something went wrong. Couldn't find previous item.`;
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

module.exports = PrevItemHandler;