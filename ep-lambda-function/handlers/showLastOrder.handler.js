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

const Cortex = require('./../cortex');

function createNoLastOrderResponse(sessionAttributes) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
                contentType: 'PlainText',
                content: 'We coudn\'t find yor last order.'
            }
        }
    };
};

function createLastOrderResponse(sessionAttributes, availableItems) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
                contentType: 'PlainText',
                content: 'Here is your last order:\n' +
                    availableItems
                        .map(e => ` - ${e._item[0]._definition[0]['display-name']}`)
                        .join('\n')
            }
        }
    };
}

const ShowLastOrderHandler = async function(event) {
    const cortex = new Cortex(undefined, event.sessionAttributes.token);
    console.log(`Fetching last order`);
    const lastOrder = await cortex.getLastOrder();
    console.log(`Fetched last order`);

    if (!lastOrder) {
        console.log(`Could not fetch last order`);
        const noLastOrderResponse = createNoLastOrderResponse(event.sessionAttributes);
        console.log(`Responding with ${JSON.stringify(noLastOrderResponse, null, 2)}`);
        return noLastOrderResponse;
    }

    const orderItems = lastOrder._lineitems[0]._element;

    const lastOrderResponse = createLastOrderResponse(event.sessionAttributes, orderItems);
    console.log(`Responding with lastOrderResponse = ${JSON.stringify(lastOrderResponse, null, 2)}`);
    return lastOrderResponse;
};

module.exports = ShowLastOrderHandler;
