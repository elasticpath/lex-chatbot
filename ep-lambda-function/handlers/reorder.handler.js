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

function createOrderCreatedResponse(sessionAttributes) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
                contentType: 'PlainText',
                content: 'Your order has been created.'
            }
        }
    };
};

function createThankYouResponse(sessionAttributes) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
                contentType: 'PlainText',
                content: 'The order has not been placed.'
            }
        }
    };
}

function createConfirmReorderResponse(sessionAttributes, availableItems) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName: 'ReorderIntent',
            message: {
                contentType: 'PlainText',
                content: 'Would you like to re-order following item(s) from your last order?\n' +
                    availableItems
                        .map(e => ` - ${e._item[0]._definition[0]['display-name']}`)
                        .join('\n')
            }
        }
    };
}

function createConfirmReplaceResponse(sessionAttributes, replaceItems) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName: 'ReorderIntent',
            message: {
                contentType: 'PlainText',
                content: 'Some of the items from your last order are not available anymore. Would you like to reorder with the following replacements:\n' +
                    replaceItems
                        .map(e => ` - Replace ${e._item[0]._definition[0]['display-name']} with ${e._item[0]._recommendations[0]._replacement[0]._element[0]._definition[0]['display-name']}`)
                        .join('\n')
            }
        }
    };
}

function filterAvailableItems(order) {
    return order._lineitems[0]._element.filter(e =>
        !e._item[0]._addtocartform[0].messages ||
        e._item[0]._addtocartform[0].messages.filter(m => m.type === 'error' && m.id === 'item.insufficient.inventory').length === 0
    );
}

function filterReplaceableItems(order) {
    return order._lineitems[0]._element.filter(e =>
        (
            !e._item[0]._addtocartform[0].messages ||
            e._item[0]._addtocartform[0].messages.filter(m => m.type === 'error' && m.id === 'item.insufficient.inventory').length > 0
        ) &&
        e._item[0]._recommendations &&
        e._item[0]._recommendations[0] &&
        e._item[0]._recommendations[0]._replacement &&
        e._item[0]._recommendations[0]._replacement[0] &&
        e._item[0]._recommendations[0]._replacement[0]._element &&
        e._item[0]._recommendations[0]._replacement[0]._element[0] &&
        e._item[0]._recommendations[0]._replacement[0]._element[0]._definition &&
        e._item[0]._recommendations[0]._replacement[0]._element[0]._definition[0] &&
        e._item[0]._recommendations[0]._replacement[0]._element[0]._addtocartform &&
        e._item[0]._recommendations[0]._replacement[0]._element[0]._addtocartform[0] &&
        (
            !e._item[0]._recommendations[0]._replacement[0]._element[0]._addtocartform[0].messages ||
            e._item[0]._recommendations[0]._replacement[0]._element[0]._addtocartform[0].messages.filter(m =>
                m.type === 'error' && m.id === 'item.insufficient.inventory'
            ).length === 0
        )
    );
}

const ReorderHandler = async function(event) {
    if (event.currentIntent.confirmationStatus === 'Denied') {
        console.log('confirmationStatus === Denied');
        const thankYouResponse = createThankYouResponse(event.sessionAttributes);
        console.log(`Responding with ${JSON.stringify(thankYouResponse, null, 2)}`);
        return thankYouResponse;
    }

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

    console.log(`Filtering non/available items`);
    const availableItems = filterAvailableItems(lastOrder);
    const replaceableItems = filterReplaceableItems(lastOrder);
    console.log(`Found ${availableItems.length} available and ${replaceableItems.length} replacable items`);

    if (event.currentIntent.confirmationStatus !== 'Confirmed') {
        console.log('confirmationStatus !== Confirmed');

        // are you sure?
        if (replaceableItems.length === 0) {
            console.log('replaceableItems.length === 0');
            const reorderResponse = createConfirmReorderResponse(event.sessionAttributes, availableItems);
            console.log(`Responding with reorderResponse = ${JSON.stringify(reorderResponse, null, 2)}`);
            return reorderResponse;
        } else {
            console.log('replaceableItems.length !== 0');
            const replaceResponse = createConfirmReplaceResponse(event.sessionAttributes, replaceableItems);
            console.log(`Responding with replaceResponse = ${JSON.stringify(replaceResponse, null, 2)}`);
            return replaceResponse;
        }
    } else {
        console.log('confirmationStatus === Confirmed');

        // make reorder
        console.log(`Creating temp cart`);
        const cartName = await cortex.createTempCart();
        console.log(`Created cart ${cartName}`);

        console.log(`Repeating last order`);
        await cortex.repeatOrder(cartName, availableItems, replaceableItems);

        console.log(`Deleting non-default carts`);
        await cortex.deleteNonDefaultCarts();

        return createOrderCreatedResponse(event.sessionAttributes);
    }
};

module.exports = ReorderHandler;
