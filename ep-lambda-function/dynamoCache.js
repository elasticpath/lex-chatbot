const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });
const TABLE_NAME = process.env.CACHE_TABLE || 'lex-cache';
const id = process.env.GUID;



async function put(payload) {
    let params = {
        TableName : TABLE_NAME,
        Item: {
            responseId: id,
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

async function fetch() {
    let params = {
        TableName: TABLE_NAME,
        Key: {
            responseId: id
        }
    };
    try {
        let data = await dynamoDB.get(params).promise();
        // console.log("In dynamoCache.js, fetching from Dynamo.");
        const response = {
            isCart: data.Item.isCart,
            curProduct: JSON.parse(data.Item.curProduct),
            curProductIndex: data.Item.curProductIndex,
            curResponse: JSON.parse(data.Item.curResponse)
        }

        return { response };
    } catch(error) {
        console.log("Error in dynamoCache.js, returning status 400");
        return {
            statusCode: 400,
            error: `Could not fetch: ${error.stack}`
          };
    }
}


module.exports.put = put;
module.exports.fetch = fetch;