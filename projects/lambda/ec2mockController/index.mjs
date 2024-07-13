/*
 * index.mjs - lambda to turn on or off a lambda
 */

function checkParameters( queryString ){
  return queryString['op'] && queryString['server'];
}

let internalState = [
  { id : '5a2OSbY4c4Hs1VRdQboC',
    previousStatus : '', 
    currentStatus : 'stopped'
  },
  {
    id : 'rQUharPQln5DrAAP7FE0', 
    previousStatus : '',
    currentStatus : 'stopped'
  }
]

function changeServerStatus( serverNumber, newStatus ){
  internalState[serverNumber].previousStatus = internalState[serverNumber].currentStatus;
  internalState[serverNumber].currentStatus = newStatus;
}

function serverId( serverNumber ){
  return internalState[serverNumber].id;
}

function previousStatus( serverNumber ){
  return internalState[serverNumber].previousStatus;
}

function currentStatus( serverNumber ){
  return internalState[serverNumber].currentStatus;
}

let serverList = [{
  id : "0", 
  name: "Craft2Exile (Cesar, Jorge, Santi...)"
},
{
  id : "1",
  name: "CreateMod (Quique, Martín, Santi)"
}];

export const handler = (event, context) => {

  console.log( "this is the mock handler" );
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

  let serverNumber = parseInt(queryString['server']);
  if( queryString['op'] === 'list' ){
    return new Promise( (resolve,reject) => {
      resolve( serverList );
    });
  }

  if( queryString['op'] === 'start' ){
    console.log( "STARTING SERVER" );
    return new Promise( (resolve, reject) => {
      changeServerStatus( serverNumber, "starting" );
      setTimeout( () => {
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
                "Name": currentStatus(serverNumber)
              },
              "InstanceId": serverId(serverNumber),
              "PreviousState": {
                "Code": 80,
                "Name": previousStatus(serverNumber)
              }
            }
          ]
        })
      }, Math.random() * 5000 );
    });
  }

  if( queryString['op'] === 'stop' ){
    console.log( "STOPPING SERVER" );
    return new Promise( (resolve, reject) => {
      setTimeout( () => {
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
                "Name": currentStatus( serverNumber )
              },
              "InstanceId": serverId( serverNumber ),
              "PreviousState": {
                "Code": 16,
                "Name": previousStatus( serverNumber )
              }
            }
          ]
        });
      }, Math.random() * 5000 );
    });
  }

  if( queryString['op'] === 'status' ){
      return new Promise( (resolve, reject) => {
        let allStatuses = [];
        let statusTemplate = {
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
        };
        let server = { ...statusTemplate };
        server.InstanceId = serverId( serverNumber );
        server.InstanceStatus.Details.Status = currentStatus( serverNumber );
        allStatuses.push( server );
      
        setTimeout( () => {
          resolve({
            "$metadata": {
              "httpStatusCode": 200,
              "requestId": "261ec560-ac95-4952-8739-afb885e8a7e6",
              "attempts": 1,
              "totalRetryDelay": 0
            },
            "InstanceStatuses": allStatuses
          });
        }, Math.random() * 5000 );

      });

  }

}
