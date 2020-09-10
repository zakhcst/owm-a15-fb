// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const emulator = true;
const firebaseConfig = {
  apiKey: 'AIzaSyCT-Uab-tDlXLBKzWdv7rq4exZchMDRyR8',
  authDomain: 'owm-a7-fb.firebaseapp.com',
  databaseURL: 'https://owm-a7-fb.firebaseio.com',
  projectId: 'owm-a7-fb',
  storageBucket: 'owm-a7-fb.appspot.com',
  messagingSenderId: '1062734348256'
};
const firebaseEmulator = {
  databaseURL: 'http://192.168.1.15:9000/?ns=emulator',
  ssl: false,
};
const localEmulatorFunctionsUrl = 'http://192.168.1.15:5001/owm-a10-fb/us-central1';
const firebaseFunctionsUrl = 'https://us-central1-owm-a7-fb.cloudfunctions.net';

export const environment = {
  production: false,
  name: 'dev',
  timeStamp: '1599782176337',
  hash: 'c6a0683',
  version: '0.10.1',
  emulator,
  firebase: emulator ? firebaseEmulator : firebaseConfig,
  'functions': emulator ? localEmulatorFunctionsUrl : firebaseFunctionsUrl,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
