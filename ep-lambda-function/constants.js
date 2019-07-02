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

module.exports.AmazonIntent = {
    INTENT_REQUEST: 'IntentRequest',
    STOP: 'AMAZON.StopIntent',
    HELP: 'AMAZON.HelpIntent',
    CANCEL: 'AMAZON.CancelIntent',
    YES: 'AMAZON.YesIntent',
    NO: 'AMAZON.NoIntent',
    FALLBACK: 'AMAZON.FallbackIntent',
};

module.exports.ElasticPathIntents = {
    EP_AUTH: 'EPAuthIntent',
    ADD_TO_CART: 'AddToCartIntent',
    ADD_TO_WISHLIST: 'AddToWishlistIntent',
    CHECKOUT: "CheckoutCartIntent",
    DESCRIBE_LISTED_PRODUCT: 'DescribeListedProductIntent',
    DESCRIBE_PRODUCT: 'DescribeProductIntent',
    GET_CART: 'GetCartIntent',
    GET_WISLIST: 'GetWishlistIntent',
    KEYWORD_SEARCH: 'KeywordSearchIntent',
    MOVE_TO_CART: 'MoveToCartIntent',
    MOVE_TO_WISHLIST: 'MoveToWishlistIntent',
    NEXT_ITEM: 'NextItemIntent',
    PREVIOUS_ITEM: 'PrevItemIntent',
    REMOVE_FROM_CART: 'RemoveFromCartIntent',
    REMOVE_FROM_WISHLIST: 'RemoveFromWishlistIntent',
    SPECIFIC_ITEM: 'SpecificItemIntent',
};

module.exports.Errors = {
    STATUS_CODE_ERROR: 'StatusCodeError',
};

module.exports.PROD_DESCRIPTION = 'summary';
