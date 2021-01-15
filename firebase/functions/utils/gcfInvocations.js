const admin = require("firebase-admin");
const { disableBilling } = require("./disable-billing");
const db = admin.database();
const constants = require("../utils/constants").constants;

exports.gcfInvocationsMonitorFactory = (func) => (...args) => {
  const now = new Date();
  const secondNow = parseInt(now.valueOf() / 1000);
  const ref = db.ref("invocations-log/" + secondNow);
  return ref
    .transaction((value) => {
      value = value || 0;
      return value + 1;
    })
    .then((invocationsSnap) => {
      const invocations = invocationsSnap.snapshot.val();
      // 'retry' calls - in case first fails, otherwise rest are confirmation for disabled billing
      if (constants.MAX_FUNCTIONS_INVOCATIONS_PER_SECOND + constants.MAX_FUNCTIONS_INVOCATIONS_PER_SECOND_RETRY < invocations) {
        console.log(`Limit Per Second ${constants.MAX_FUNCTIONS_INVOCATIONS_PER_SECOND} gcf invocations exceeded ${invocations}`);
        return disableBilling();
      }
      return func(...args);
    });
};
