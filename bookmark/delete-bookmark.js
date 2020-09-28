'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// handler to delete bookmark
module.exports.delete = (event, context, callback) => {

  const authId = event.queryStringParameters.user_id;
  const folderId = event.queryStringParameters.folder_id;
  const bookMarkId = event.pathParameters.id;

  // parameters to delete bookmark
  const params = {

    TableName: process.env.DYNAMODB_TABLE,
    Key: {
       user_id: authId
    },
    ExpressionAttributeNames: {"#attribute": "folders", "#folder_id": folderId,"#bookmark_id": bookMarkId,"#bmark": "bookmarks" },
    UpdateExpression: "REMOVE #attribute.#folder_id.#bmark.#bookmark_id"                                                                // defined expression to delete a bookmark

  };

  // delete bookmark in the database
  dynamoDb.update(params, (error, result) => {

    if (error) {
      // handle potential errors
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t delete the bookmark.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
          headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify("success")                                   // return response on successful deletion
    };
    callback(null, response);
  });
};
