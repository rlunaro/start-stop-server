
import { handler } from './index.mjs';

process.env["INSTANCE0"] = "YAVEREMOS";
process.env["INSTANCE1"] = "YAVEREMOS2";
process.env["REGION"] = "zimbawe";

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

