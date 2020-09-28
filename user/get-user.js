'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const passHash = require('password-hash');
const stringHash = require('string-hash');

// user sign up handler
module.exports.get = (event, context, callback) => {

  // get username and password through params
  const userName = event.queryStringParameters.user_name;
  const password = event.queryStringParameters.password;

  // params for user sign up
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      user_id: stringHash(userName).toString()                            // hash the username to get user id
    }
  };

  // fetch user id from database
  dynamoDb.get(params, (error, result) => {

    if (error) {
      // handle potential errors
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'User not exists'
      });
      return;
    }
    else if (passHash.verify(password,result.Item.password)) {                  // decrypt the password and compare with plain text
      const response = {
        statusCode: 200,
         headers:{
        "Access-Control-Allow-Origin": "*"
      },
        body: JSON.stringify(result.Item.user_id),                             // return user id for successful authentication
      };
      callback(null, response);
    }else {                                                                     // if password doesn't match
      const response = {
        statusCode: 401,
         headers:{
        "Access-Control-Allow-Origin": "*"
      },
        body: JSON.stringify("Invalid password ")                          // invalid password response
      };
      callback(null, response);
    }

  });
};
