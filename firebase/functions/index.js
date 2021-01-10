const functions = require("firebase-functions");
const admin = require("firebase-admin");
const isEmulator = require('./local-emulator/emulator').isEmulator;

let options;
if (isEmulator() === true) {
  options = { databaseURL: "http://localhost:9000/?ns=owm-a11-fb", ssl: false };
} else {
  options = { databaseURL: "https://owm-a7-fb.firebaseio.com" };
}
admin.initializeApp({
  credential: admin.credential.applicationDefault(), ...options,
});

const { gcfInvocationsMonitorFactory } = require("./utils/gcfInvocations");
const { httpTest } = require("./http/http-test");
const { getip } = require("./http/get-ip");
const { checkBudgetPubSub } = require("./pub-sub/check-budget-pubsub");

const owm = require("./rtbd/owm");
const stats = require("./rtbd/stats");

// Http triggers
exports.test = functions.https.onRequest(gcfInvocationsMonitorFactory(httpTest));
exports.getip = functions.https.onRequest(gcfInvocationsMonitorFactory(getip));

// RTBD triggers
exports.owmOnWrite = functions.database
  .ref("/owm/{cityId}/updated")
  .onWrite(gcfInvocationsMonitorFactory(owm.onWrite));
exports.onWriteToStatsCityUpdatesIncAll = functions.database
  .ref("/stats/{cityId}/u")
  .onWrite(gcfInvocationsMonitorFactory(stats.onWriteToStatsCityUpdatesIncAll));
exports.onWriteToStatsCityReadsIncAll = functions.database
  .ref("/stats/{cityId}/r")
  .onWrite(gcfInvocationsMonitorFactory(stats.onWriteToStatsCityReadsIncAll));

// Pub Sub
exports.checkBudgetPubSub = functions.pubsub
  .topic("budget_alert_owm-a7-fb")
  .onPublish(checkBudgetPubSub);
