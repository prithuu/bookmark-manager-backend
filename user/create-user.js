'use strict';

const passHash = require('password-hash');
const stringHash = require('string-hash');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// user-creation handler
module.exports.create = (event, context, callback) => {

  // parameters for user creation
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      user_id: stringHash(event.queryStringParameters.user_name).toString(),  // hash the user name for partition key
      user_name: event.queryStringParameters.user_name,
      password: passHash.generate(event.queryStringParameters.password),      // encrypt the password
      folders: {
          root: {                                                             // create an empty root folder
              bookmarks: {

              }
          }
      }
    },
    ConditionExpression: "attribute_not_exists(user_id)"                     // check for user existence
  };

  // write the user to the database
  dynamoDb.put(params, (error) => {

    if (error) {
      // handle potential errors
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'User Already Exists'
      });
      return;
    }

    // response
    const response = {
      statusCode: 200,
      headers:{
        "Access-Control-Allow-Origin": "*"                                    // for development purpose origin set to '*'
      },
      body: JSON.stringify(params.Item.user_id)                               // return user-id for successful creation
    };
    callback(null, response);
  });
};
