'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// folder deletion handler
module.exports.delete = (event, context, callback) => {


  const authId = event.queryStringParameters.user_id;
  const folderId = event.pathParameters.id;                                     // get folder id from path parameters

  // parameters for folder deletion
  const params = {

    TableName: process.env.DYNAMODB_TABLE,
    Key: {
       user_id: authId
    },
    ExpressionAttributeNames: {"#attribute":"folders", "#folder_id" : folderId},     // mapped attribute names for update expression
    UpdateExpression: "REMOVE #attribute.#folder_id"                                 // defined expression for folder deletion

  };

  // delete the folder from the database
  dynamoDb.update(params, (error, result) => {

    if (error) {
      // handle potential errors
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t delete the folder.'
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
          headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify("success")                                    // return response on successful deletion
    };
    callback(null, response);
  });
};
