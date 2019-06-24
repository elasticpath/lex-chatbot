const lexResponses = require('../lexResponses');
const handler = require('../requestHandler');
const cache = require('../dynamoCache');

async function getReply(intentRequest) {
    const searchKeyword = intentRequest.currentIntent.slots.searchKeyword;
    
    if (searchKeyword !== null && searchKeyword !== "") {
            const response = await handler.handleSearchByKeyword(intentRequest);
            return response;
    }
    
    return `Invalid search terms. Please try again.`;
}

const KeywordSearchHandler = async function (intentRequest, callback) {
        const slots = intentRequest.currentIntent.slots;
        const searchKeyword = slots.searchKeyword;
        let sessionAttributes = intentRequest.sessionAttributes;
        
        await getReply(intentRequest);
        let lexReply;
        
        const reply = await cache.fetch();
        
        if (reply === "" || reply.statusCode === 404) {
            lexReply = `Invalid search terms. Please try again.`;
        } if (reply === "" || reply.statusCode === 400) {
            lexReply = `Hm, our database seems to be down.`;
        } else {
            try {
                const count = reply.response.curResponse.length;
                const first = reply.response.curProduct._definition[0]['display-name'];

                const resultText = count > 1 ? 'results' : 'result';
                lexReply = `I found ${count} ${resultText} for ${searchKeyword}. The first result is:` + " " + `${JSON.stringify(first)}`;
                
            } catch(e) {
                console.error(e);
                lexReply = `No results found. Please try searching for a different item.`;
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

module.exports = KeywordSearchHandler;