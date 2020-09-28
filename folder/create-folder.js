'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

// folder creation handler
module.exports.create = (event, context, callback) => {

  const authId = event.queryStringParameters.user_id;                         // get user id for authentication
  const folderName = event.queryStringParameters.folder_name;                 // get folder name
  const folderId = uuid.v4();                                                 // generate unique folder id

  const newFolder = {                                                           // empty folder with bookmarks map
      "name": folderName,
      "bookmarks": {

      }
  };

  // parameters for folder creation
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
       user_id: authId
    },
    ExpressionAttributeNames: {"#attribute" : "folders", "#f_id" : folderId},      // map attribute name for update expression
    ExpressionAttributeValues: { ":folder" : newFolder},                           // map attribute value for update expression
    UpdateExpression: "SET #attribute.#f_id= :folder",                             // defined update expression for folder creation
    ProjectionExpression: "folders",                                               // project only folder
    ReturnValues: 'UPDATED_NEW'                                                    // return created folder
  };

  // write the folder to database
  dynamoDb.update(params, (error, result) => {

    if (error) {
        // handle potential errors
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the folder.'
      });
      return;
    }

    // response
    const response = {
      statusCode: 200,
          headers: {
        "Access-Control-Allow-Origin": "*" ,
        "Access-Control-Allow-Methods":"PUT,GET,POST,OPTIONS"
      },
      body: JSON.stringify(folderId)                                   // return created folder id
    };
    callback(null, response);
  });
};
