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

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });
const TABLE_NAME = process.env.CACHE_TABLE || 'lex-cache';
const id = process.env.GUID;

async function put(payload, sessionId) {
    // Time to live set to 1 minute after latest put request.
    let time = Math.floor(Date.now() / 1000) + 60;
    // console.log(`In DynamoPut: TTL ${time}`);
    let params = {
        TableName : TABLE_NAME,
        Item: {
            responseId: sessionId,
            ttl : time,
            curResponse: payload.curResponse,
            curProduct: payload.curProduct,
            curProductIndex: payload.curProductIndex,
            isCart: payload.isCart
        }
    };
    try {
        let data = await dynamoDB.put(params).promise();
        return { statusCode: 200, body: JSON.stringify({ params, data }) };
    } catch(error) {
        return {
            statusCode: 400,
            error: `Could not post: ${error.stack}`
        };
    }
}

async function fetch(sessionId) {
    let params = {
        TableName: TABLE_NAME,
        Key: {
            responseId: sessionId
        }
    };
    try {
        let data = await dynamoDB.get(params).promise();
        const response = {
            isCart: data.Item.isCart,
            curProduct: JSON.parse(data.Item.curProduct),
            curProductIndex: data.Item.curProductIndex,
            curResponse: JSON.parse(data.Item.curResponse)
        }

        return { response };
    } catch(error) {
        return {
            statusCode: 400,
            error: `Could not fetch: ${error.stack}`
        };
    }
}

module.exports.put = put;
module.exports.fetch = fetch;
