'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// handler to update folder name
module.exports.update = (event, context, callback) => {

  const authId = event.queryStringParameters.user_id;
  const newName = event.queryStringParameters.folder_name;                      // new name to update
  const folderId = event.queryStringParameters.folder_id;                       // folder id to be updated

  // parameters for folder name update
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      user_id: authId
    },
    ExpressionAttributeNames: {                                                 // mapped attribute names for update expression
      "#attribute": "folders",
      '#folder_id': folderId,
      '#old_name': "name"
    },
    ExpressionAttributeValues: {                                                // mapped new folder name with value
      ':new_name': newName
    },
    UpdateExpression: 'SET #attribute.#folder_id.#old_name = :new_name',
    ReturnValues: 'UPDATED_NEW'                                                  // return updated folder
  };

  // update folder name in database
  dynamoDb.update(params, (error, result) => {

    if (error) {
      // handle potential errors
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.'
      });
      return;
    }

    // response
    const response = {
      statusCode: 200,
        headers:{
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(result.Attributes)                                         // return updated folder response
    };
    callback(null, response);
  });
};
