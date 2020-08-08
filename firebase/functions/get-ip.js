const util = require('util');
const corsp = util.promisify(require('cors')({ origin: true }));

const isEmulator = require('./local-emulator/isEmulator');
const getLocalhostExternalIp = require('./local-emulator/localhost-external-ip');

exports.getip = async (request, response) => {
  await corsp(request, response);

  if (isEmulator.isEmulator()) {
    const lheip = await getLocalhostExternalIp.getIp();
    return response.send(lheip);
  }
  response.send(request.headers['x-appengine-user-ip']);
};
