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

    if (searchKeyword !== null && searchKeyword !== "") {
            const response = await handler.handleSearchByKeyword(intentRequest);
            return response;
    }
    
    return `Invalid search terms. Please try again.`;
}

const PrevItemHandler = async function (intentRequest, callback) {
        let sessionAttributes = intentRequest.sessionAttributes;
        let lexReply = "";
        const reply = await cache.fetch(intentRequest.sessionAttributes.token);
        
        if (reply === "" || reply.statusCode === 404) {
            lexReply = lexResponses.errorCodes.ERROR_404;
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
                        lexReply = lexResponses.list.START_OF_LIST;
                    }
                } else {
                    lexReply = lexResponses.generalResponse.EMPTY_LIST;
                }
            } catch(e) {
                console.log(e);
                lexReply = lexResponses.generalResponse.EXPIRED_SESSION;
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