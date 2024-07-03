/*
 * index.mjs - lambda to turn on or off a lambda
 */

import { fromEnv } from "@aws-sdk/credential-providers";
import { EC2Client, 
          StartInstancesCommand, 
          StopInstancesCommand,
          DescribeInstanceStatusCommand} from "@aws-sdk/client-ec2";

function checkParameters( queryString ){
  return queryString['op'] && queryString['server'];
}

function pickupServer( serverNumber ){
  if( serverNumber === "1" )
    return process.env.INSTANCE1;
  if( serverNumber === "2" )
    return process.env.INSTANCE2;
  if( serverNumber === "3" )
    return process.env.INSTANCE3;
}

export const FAKE_handler = (event, context) => {

  console.log( "this is the fake handler" );
  console.log( JSON.stringify( event, null, 2));
  let queryString = event["queryStringParameters"];

  if( !checkParameters( queryString ) ){
    return new Promise( (resolve) => {
      resolve({
        statusCode: 400, 
        body: `Query string parameters are
          are not correct: ${JSON.stringify(queryString)}`
      }); 
    })
  }

  if( queryString['op'] === 'start' ){
    console.log( "STARTING SERVER" );
    return new Promise( (resolve, reject) => {
      resolve({
        "$metadata": {
          "httpStatusCode": 200,
          "requestId": "66ada73b-19ed-4dc0-b89e-75b0330942c7",
          "attempts": 1,
          "totalRetryDelay": 0
        },
        "StartingInstances": [
          {
            "CurrentState": {
              "Code": 0,
              "Name": "pending"
            },
            "InstanceId": "i-018f143692e1c3c4d",
            "PreviousState": {
              "Code": 80,
              "Name": "stopped"
            }
          }
        ]
      })
    });
  }

  if( queryString['op'] === 'stop' ){
    console.log( "STOPPING SERVER" );
    return new Promise( (resolve, reject) => {
      resolve({
        "$metadata": {
          "httpStatusCode": 200,
          "requestId": "6952db36-b0d1-45e8-aa8e-40c70a0ce089",
          "attempts": 1,
          "totalRetryDelay": 0
        },
        "StoppingInstances": [
          {
            "CurrentState": {
              "Code": 64,
              "Name": "stopping"
            },
            "InstanceId": "i-018f143692e1c3c4d",
            "PreviousState": {
              "Code": 16,
              "Name": "running"
            }
          }
        ]
      });
    });
  }

  if( queryString['op'] === 'status' ){
    if( Math.random() >= 0.5 ){
      console.log( "STATUS OF SERVER: RETURNING RUNNING" );
      return new Promise( (resolve, reject) => {
        resolve({
          "$metadata": {
            "httpStatusCode": 200,
            "requestId": "261ec560-ac95-4952-8739-afb885e8a7e6",
            "attempts": 1,
            "totalRetryDelay": 0
          },
          "InstanceStatuses": [
            {
              "AvailabilityZone": "eu-south-2b",
              "InstanceId": "i-018f143692e1c3c4d",
              "InstanceState": {
                "Code": 16,
                "Name": "running"
              },
              "InstanceStatus": {
                "Details": [
                  {
                    "Name": "reachability",
                    "Status": "initializing"
                  }
                ],
                "Status": "initializing"
              },
              "SystemStatus": {
                "Details": [
                  {
                    "Name": "reachability",
                    "Status": "initializing"
                  }
                ],
                "Status": "initializing"
              }
            }
          ]
        });
      });
    }else{
      return new Promise( (resolve, reject) => {
        console.log( "STATUS OF SERVER: RETURNING STOPPED" );
        resolve({
          "$metadata": {
            "httpStatusCode": 200,
            "requestId": "0d353743-522a-4176-b157-f82d1741859a",
            "attempts": 1,
            "totalRetryDelay": 0
          },
          "InstanceStatuses": [
            {
              "AvailabilityZone": "eu-south-2b",
              "InstanceId": "i-018f143692e1c3c4d",
              "InstanceState": {
                "Code": 80,
                "Name": "stopped"
              },
              "InstanceStatus": {
                "Status": "not-applicable"
              },
              "SystemStatus": {
                "Status": "not-applicable"
              }
            }
          ]
        });
      });
    }
  }

}

export const handler = (event) => {

  let queryString = event["queryStringParameters"];

  if( !checkParameters( queryString ) ){
    return new Promise( (resolve) => {
      resolve({
        statusCode: 400, 
        body: `Query string parameters are
          are not correct: ${JSON.stringify(queryString)}`
      }); 
    })
  }

  let config = {
    region: process.env.REGION,
    credentials: fromEnv()
  };
  
  const client = new EC2Client(config);

  let command = null;
  if( queryString['op'] === 'start' ){
    console.log( `starting instance ${pickupServer( queryString['server'] )}` );
    command = new StartInstancesCommand({ 
      InstanceIds: [ 
        pickupServer( queryString['server'] )
      ]
    });  
  }

  if( queryString['op'] === 'stop' ){
    console.log( `stopping instance ${pickupServer( queryString['server'] )}` );
    command = new StopInstancesCommand({
      InstanceIds: [
        pickupServer( queryString['server'] )
      ]
    });
  }

  if( queryString['op'] === 'status' ){
    console.log( `checking status of instance ${pickupServer( queryString['server'] )}` );
    command = new DescribeInstanceStatusCommand({
      InstanceIds: [
        pickupServer( queryString['server'] )
      ],
      IncludeAllInstances: true
    });
  }

  return new Promise( (resolve,reject) => {
    client.send(command)
    .then( (commandResponse) => {
      resolve( {
        statusCode: 200,
        body: JSON.stringify( commandResponse )
      });
    })
    .catch( (errorResponse) => {
      reject({
        statusCode: 500, 
        body: JSON.stringify( errorResponse )
      });
    });  
  })


};



