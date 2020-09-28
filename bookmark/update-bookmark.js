'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// handler to update bookmark
module.exports.update = (event, context, callback) => {

  const authId = event.queryStringParameters.user_id;
  const folderId = event.queryStringParameters.folder_id;
  const bookMarkId = event.queryStringParameters.bookmark_id;

  // define a updated bookmark
  const updatedBookmark={
    "name": event.queryStringParameters.bookmark_name,
    "url": event.queryStringParameters.url
  };

  // parameter for bookmark update
  const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        user_id: authId
      },
      ExpressionAttributeNames: {"#attribute": "folders", "#folder_id": folderId, "#bmark_id": bookMarkId, "#bmark": "bookmarks"},
      ExpressionAttributeValues: {":bmark": updatedBookmark},
      UpdateExpression: "SET #attribute.#folder_id.#bmark.#bmark_id= :bmark",                                                                     // defined expression to update bookmark
      ReturnValues: 'UPDATED_NEW'                                                                                                                 // return updated bookmark
    };

  // update bookmark in the database
  dynamoDb.update(params, (error, result) => {

    if (error) {
      // handle potential errors
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the bookmark.'
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
          headers:{
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(result.Attributes)                                           // return updated bookmark response
    };
    callback(null, response);
  });
};
