/*
 * index.mjs - lambda to turn on or off a lambda
 */

import { fromEnv } from "@aws-sdk/credential-providers";
import { EC2Client, 
          StartInstancesCommand, 
          StopInstancesCommand} from "@aws-sdk/client-ec2";

function checkParameters( queryString ){
  return true;
//  return queryString['op'] && queryString['server'];
}

function pickupServer( serverNumber ){
  if( serverNumber === "1" )
    return process.env.INSTANCE1;
  if( serverNumber === "2" )
    return process.env.INSTANCE2;
  if( serverNumber === "3" )
    return process.env.INSTANCE3;
}

export const handler = (event) => {

  let queryString = event["queryStringParameters"];

  console.log( "value of querystring: ", queryString );

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
    command = new StartInstancesCommand({ 
      InstanceIds: [ 
        pickupServer( queryString['server'] )
      ]
    });  
  }

  if( queryString['op'] === 'stop' ){
    command = new StopInstancesCommand({
      InstanceIds: [
        pickupServer( queryString['server'] )
      ]
    });
  }

  if( queryString['op'] === 'status' ){
    command = new DescribeInstanceStatusCommand({
      InstanceIds: [
        pickupServer( queryString['server'] )
      ]
    });
  }

  client.send(command)
  .then( (commandResponse) => {
    console.log("the reponse is:");
    console.log( commandResponse );
    return( {
      statusCode: 200,
      body: JSON.stringify( commandResponse )
    });
  })
  .catch( (errorResponse) => {
    return({
      statusCode: 500, 
      body: JSON.stringify( errorResponse )
    });
  });

};


handler({"queryStringParameters": {
  "op": "start",
  "server": "1"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
});


