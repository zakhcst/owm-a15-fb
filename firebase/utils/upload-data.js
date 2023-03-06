// console.log("Cities data seed uploaded successfully.");
// process.exit();

var _ = require('lodash');
var euCapitals = require('../../misc/eu-capitals.json');
var admin = require("firebase-admin");
var serviceAccount = require('../../../owm-a7-fb-credentials/owm-a7-fb-firebase-adminsdk-kdv5b-8c3ede325e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://owm-a6-fb.firebaseio.com'
});

var db = admin.database();
var ref = db.ref('eu-capitals');
var refRoot = db.ref();
// ref.once("value", function(snapshot) {
//   console.log('Check downloaded');
//   console.log(snapshot.val());
// });

ref.set(euCapitals, function (error) {
  if (error) {
    console.log("Data could not be saved." + error);
  } else {
    console.log("Data saved successfully.");
  }
  process.exit();
});
