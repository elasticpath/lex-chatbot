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