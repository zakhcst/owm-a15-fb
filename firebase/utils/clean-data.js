
var _ = require('lodash');
var admin = require("firebase-admin");
// var serviceAccount = require('../../../owm-a7-fb-credentials/owm-a7-fb-firebase-adminsdk-06hnz-89de3dda7e.json');
var serviceAccount = require('../../../owm-a7-fb-credentials/owm-a7-fb-42f2218b2354-firebase-adminsdk-he3s2.json');
const { timestamp } = require('rxjs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://owm-a7-fb.firebaseio.com'
});

var db = admin.database();
var ref = db.ref();
var downloadedData;
var updateData = {
    'history-log': {},
    'invocations-log': {},
    'errors-log': {}
};


ref.once("value", function(snapshot) {
  console.log('Check downloaded');
  downloadedData = snapshot.val();
//   console.log(downloadedData);
  reduceHistoryData();
//   updateData();
  process.exit();
});

function reduceHistoryData() {
    var historyLog = downloadedData['history-log'];
    var historyLogIP = Object.keys(historyLog);
    var historyLogReducedIPs = historyLogIP
    .map(ip =>  Object.keys(historyLog[ip]).sort().slice(-1))
    .sort()
    .slice(-20)
    .map(timestamp => historyLogIP.find(ip => historyLog[ip][timestamp]))
    .reduce((acc, ip) => {
        acc[ip] = historyLog[ip];
        return acc;
    }, {});

    console.log('historyLogReducedIPs');
    console.log(historyLogReducedIPs['']);
}


function updateData() {
    ref.set(updateData, function (error) {
        if (error) {
            console.log("Data could not be saved." + error);
        } else {
           console.log("Data updated successfully.");
        }
        process.exit();
    });
};

