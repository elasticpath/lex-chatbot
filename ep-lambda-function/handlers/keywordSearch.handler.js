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
                const count = reply.response.curResponse.length;
                const first = reply.response.curProduct._definition[0]['display-name'];

                const resultText = count > 1 ? 'results' : 'result';
                lexReply = `Okay. I found ${count} ${resultText} for ${searchKeyword}. The first result is:` + " " + `${JSON.stringify(first)}`;
                
            } catch(e) {
                console.error(e);
                lexReply = lexResponses.generalResponse.NO_RESULTS;
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