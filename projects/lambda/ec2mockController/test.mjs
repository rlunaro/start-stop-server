
import { handler } from './index.mjs';

process.env["REGION"] = "zimbawe";

handler({"queryStringParameters": {
  "op": "list"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
})
.catch( (error) => {
  console.log( error );
});

handler({"queryStringParameters": {
  "op": "status",
  "server": "0"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
})
.catch( (error) => {
  console.log( error );
});

handler({"queryStringParameters": {
  "op": "start",
  "server": "1"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
})
.catch( (error) => {
  console.log( error );
});


handler({"queryStringParameters": {
  "op": "stop",
  "server": "1"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
})
.catch( (error) => {
  console.log( error );
});
