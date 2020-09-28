'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// handler to get all folders
module.exports.list = (event, context, callback) => {

  const authId = event.queryStringParameters.user_id;

  // parameters for getting all folders for particular user
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      user_id: authId
    }
  };

  // fetch folders from database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the folders.'
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
        headers:{
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(result.Item.folders)                                 // return all folders
    };
    callback(null, response);
  });
};
