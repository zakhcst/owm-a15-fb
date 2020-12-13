const functions = require("firebase-functions");
const admin = require("firebase-admin");
const isEmulator = require('./local-emulator/isEmulator');

let env;
if (isEmulator.isEmulator()) {
  env = { databaseURL: "http://localhost:9000/?ns=owm-a11-fb", ssl: false };
} else {
  env = { databaseURL: "https://owm-a7-fb.firebaseio.com" };
}
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...env,
});

const { gcfInvocationsMonitorFactory } = require("./utils/gcfInvocations");
const { httpTest } = require("./http/http-test");
const { getip } = require("./http/get-ip");
const { checkBudgetPubSub } = require("./pub-sub/check-budget-pubsub");

const owm = require("./rtbd/owm");
const cities = require("./rtbd/cities");

// Http triggers
exports.test = functions.https.onRequest(
  gcfInvocationsMonitorFactory(httpTest)
);
exports.getip = functions.https.onRequest(gcfInvocationsMonitorFactory(getip));

// RTBD triggers
exports.owmOnWrite = functions.database
  .ref("/owm/{cityId}/updated")
  .onWrite(gcfInvocationsMonitorFactory(owm.onWrite));
exports.citiesOnWriteUpdate = functions.database
  .ref("/cities/{cityId}/u")
  .onWrite(gcfInvocationsMonitorFactory(cities.onWriteUpdate));
exports.citiesOnWriteRead = functions.database
  .ref("/cities/{cityId}/r")
  .onWrite(gcfInvocationsMonitorFactory(cities.onWriteRead));

// Pub Sub
exports.checkBudgetPubSub = functions.pubsub
  .topic("budget_alert_owm-a7-fb")
  .onPublish(checkBudgetPubSub);
