exports.httpTest = (request, response) => {

  let responseStr = 'Hello from Firebase!';
  responseStr += '\nheaders: ' + JSON.stringify( request.headers );
  responseStr += '\ndomain: ' + JSON.stringify( request.domain );
  responseStr += '\nbody: ' + JSON.stringify( request.body );
  responseStr += '\nparams: ' + JSON.stringify( request.params );

  return response.send(responseStr);
};
