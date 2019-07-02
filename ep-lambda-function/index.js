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

const EPAuthHandler = require('./handlers/epAuth.handler');
const AddToCartHandler = require('./handlers/addToCart.handler');
const GetCartHandler = require('./handlers/getCart.handler');
const RemoveFromCartHandler = require('./handlers/removeFromCart.handler');
const KeywordSearchHandler = require('./handlers/keywordSearch.handler');
const NextItemHandler = require('./handlers/nextItem.handler');
const PrevItemHandler = require('./handlers/prevItem.handler');
const DescribeProductHandler = require('./handlers/describeProduct.handler');
const CheckoutCartHandler = require('./handlers/checkoutCart.handler');

const { ElasticPathIntents } = require('./constants');
const handler = require("./requestHandler");
const sessionCart = [];

// Temp cortex stuff for token tracking
const cortex = require("./cortex");
const cortexInstance = cortex.getCortexInstance();

// The process that will direct Intent Invocations to their respective handler.
exports.handler = async (event, context, callback) => {
    try {
        // 1. Gather information from the current session.
        let sessionAttributes = event.sessionAttributes || {};
        
        // 2. Check if there is a token. If not, run EPAuthHandler.
        if (!sessionAttributes.token) {
            await EPAuthHandler(event, (response) => {callback(null, response);});
        }
        
        console.log(`Cortex Instance Token: ${cortexInstance.token}`);
        console.log(`Session Instance Token: ${sessionAttributes.token}`);
        
        // 3. Determine appropriate Intent Invocation.
        switch (event.currentIntent.name) {
            case ElasticPathIntents.EP_AUTH:
                await EPAuthHandler(event, (response) => {callback(null, response);});
                break;
            case ElasticPathIntents.KEYWORD_SEARCH:
                await KeywordSearchHandler(event, (response) => {callback(null, response);});
                break;
            case ElasticPathIntents.ADD_TO_CART:
                await AddToCartHandler(event, (response) => {callback(null, response);});
                break;
            case ElasticPathIntents.GET_CART:
                await GetCartHandler(event, (response) => {callback(null, response);});
                break;
            case ElasticPathIntents.DESCRIBE_PRODUCT:
                await DescribeProductHandler(event, (response) => {callback(null, response);});
                break;
            case ElasticPathIntents.DESCRIBE_STORE:
                break;
            case ElasticPathIntents.NEXT_ITEM:
                await NextItemHandler(event, (response) => {callback(null, response);}); 
                break;
            case ElasticPathIntents.PREVIOUS_ITEM:
                await PrevItemHandler(event, (response) => {callback(null, response);}); 
                break;
            case ElasticPathIntents.CHECKOUT:
                await CheckoutCartHandler(event, (response) => {callback(null, response);}); 
                break;
            case ElasticPathIntents.REMOVE_FROM_CART:
                await RemoveFromCartHandler(event, (response) => {callback(null, response);}, sessionCart);
            default:
                break;
        }     
    } catch (err) {
        callback(err);
    }
};
