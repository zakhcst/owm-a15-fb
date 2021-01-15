const admin = require("firebase-admin");
const db = admin.database();
const refInvocationsLog = db.ref("invocations-log");
const constants = require("../utils/constants").constants;

const getData = (ref) => {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      console.log("ERR reduceInvocationsLog getData");
      reject(error);
    };
    const onData = (snap) => resolve(snap.val());
    ref.on("value", onData, onError);
  });
};

exports.reduceInvocationsLog = async (pubsubEvent, context) => {
  const dataAboveLimit = await getData(refInvocationsLog.orderByValue().startAt(constants.MAX_FUNCTIONS_INVOCATIONS_PER_SECOND));
  const dataBelowLimit = await getData(refInvocationsLog.orderByValue().endAt(constants.MAX_FUNCTIONS_INVOCATIONS_PER_SECOND - 1));
  console.log("Invocations: Above Limit:", Object.keys(dataAboveLimit || {}).length, "BelowLimit:", Object.keys(dataBelowLimit || {}).length);
  
  if (!dataBelowLimit) {
    return null;
  }
  
  const update = Object.keys(dataBelowLimit).reduce((acc, key) => {
    acc[key] = null;
    return acc;
  }, {});
  return refInvocationsLog.update(update);
};
