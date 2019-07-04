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

const CheckoutCartHandler = async function (intentRequest, callback) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const checkoutResult = await handler.handleCheckoutCart(intentRequest);

    let checkoutDesc = '';
    
    // Check for default cart status. If needinfo is returned, display debug message.
    if (checkoutResult['body']['monetary-total']) {
    	const totalPrice = checkoutResult['body']['monetary-total'][0]['display'];
    	checkoutDesc = 'Checkout complete!  Total price is ' + totalPrice;
    } else if (checkoutResult.body.type === 'needinfo'){
    	checkoutDesc = checkoutResult['body']['debug-message'];
    } else {
        checkoutDesc = `Nothing to checkout. Cart is empty.`
    }

    callback(lexResponses.close(sessionAttributes, 'Fulfilled',
    {'contentType': 'PlainText', 'content': `${checkoutDesc}`}));
};

module.exports = CheckoutCartHandler;
