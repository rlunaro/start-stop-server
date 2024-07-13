
import { handler } from './index.mjs';

handler({"queryStringParameters": {
  "op": "status",
  "server": "1"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
})
.catch( (error) => {
  console.log( error );
});

handler({"queryStringParameters": {
  "op": "start",
  "server": "2"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
})
.catch( (error) => {
  console.log( error );
});


handler({"queryStringParameters": {
  "op": "stop",
  "server": "2"
}})
.then( (response) => {
  console.log( JSON.stringify( response, null, 2 ) );
})
.catch( (error) => {
  console.log( error );
});
