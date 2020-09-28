'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid')

// handler to create bookmark
module.exports.create = (event, context, callback) => {

  const authId=event.queryStringParameters.user_id;
  const folderId=event.queryStringParameters.folder_id;
  const bookMarkId=uuid.v4();                                                  // generate unique bookmark id

  // create a bookmark object
  const bookMark={
    "name":event.queryStringParameters.bookmark_name,
    "url":event.queryStringParameters.url
  }

  // parameters for bookmark creation
  const params = {

      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        user_id: authId
      },
      ExpressionAttributeNames: {"#attribute": "folders", "#folder_id": folderId, "#bmark": "bookmarks", "#b_id": bookMarkId},
      ExpressionAttributeValues: {":bookmark": bookMark},
      UpdateExpression: "SET #attribute.#folder_id.#bmark.#b_id = :bookmark"               // defined expression to create bookmark
  };

  // create a bookmark in the database
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

    // response
    const response = {
      statusCode: 200,
          headers:{
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(bookMarkId)                              // return created bookmark id
    };
    callback(null, response);
  });
};
