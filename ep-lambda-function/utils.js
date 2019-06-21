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

const { AmazonIntent } = require('./constants');

const isIntentRequestOfType = (requestEnvelope, ...intentTypes) => {
    if (requestEnvelope.request.type === AmazonIntent.INTENT_REQUEST) {
        for (const type of intentTypes) {
            if (requestEnvelope.request.intent.name === type) {
                return true;
            }
        }
    }
    return false
}

module.exports.isIntentRequestOfType = isIntentRequestOfType;
