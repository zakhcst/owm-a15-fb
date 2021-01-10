const util = require('util');
const corsp = util.promisify(require('cors')({ origin: true }));

const isEmulator = require('../local-emulator/emulator').isEmulator;
const getLocalhostExternalIp = require('../local-emulator/localhost-external-ip.js').getIp;

exports.getip = async (request, response) => {
  await corsp(request, response);
  response.set('Access-Control-Allow-Origin', '*');

  if (isEmulator() === true) {
    const localhostExternalIp = await getLocalhostExternalIp();
    return response.send(localhostExternalIp);
  }
  return response.send(request.headers['x-appengine-user-ip']);
};
