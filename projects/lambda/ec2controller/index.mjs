/*
 * index.mjs - lambda to turn on or off a lambda
 */
import fs from 'node:fs';
import { fromEnv } from "@aws-sdk/credential-providers";
import { EC2Client, 
          StartInstancesCommand, 
          StopInstancesCommand,
          DescribeInstanceStatusCommand} from "@aws-sdk/client-ec2";


function checkParameters( queryString ){
  if( queryString['op'] && queryString['op'] === 'list' )
    return true;
  return queryString['op'] && queryString['server'];
}

function pickupServer( serverNumber ){
  serverNumber = parseInt( serverNumber );
  return serverList[serverNumber].instanceId;
}


let serverList = null;

export const handler = (event) => {

  if( !serverList ){
    console.log("reading server list....");
    const data = fs.readFileSync('serverlist.json', 'utf8');
    serverList = JSON.parse( data );
  }

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
  if( queryString['op'] === 'list' ){
    return new Promise( (resolve,reject) => {
      resolve( serverList );
    });
  }

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
  });


};



