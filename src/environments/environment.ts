// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// This file supports 3 development setups:
// 1. Firebase cloud servers
// 2. Firebase emulator run in local environment (eg ip 192.168.1.15 as in virtual machine or host os)
// 3. Firebase emulator run in docker container (eg ip localhost, started as vscode remote development container)
//
// 'emulator' and 'container' constants have to be set according to the environment,
// along with in 'firebase/firebase.json' the 'emulators' section.


const emulator = false;
const container = false;

const firebaseConfigDevEnv = {
  apiKey: 'AIzaSyCT-Uab-tDlXLBKzWdv7rq4exZchMDRyR8',
  authDomain: 'owm-a7-fb.firebaseapp.com',
  databaseURL: 'https://owm-a7-fb.firebaseio.com',
  projectId: 'owm-a7-fb',
  storageBucket: 'owm-a7-fb.appspot.com',
  messagingSenderId: '1062734348256',
  appId: '1:1062734348256:web:2dc7c01ad7a90d0ab23585'
};
const firebaseFunctionsUrl = 'https://us-central1-owm-a7-fb.cloudfunctions.net';


const firebaseEmulator = {
  databaseURL: 'http://192.168.1.15:9000/?ns=owm-a12-fb',
  ssl: false,
};
const firebaseEmulatorContainer = {
  databaseURL: 'http://192.168.1.15:9000/?ns=owm-a12-fb',
  ssl: false,
};

const localEmulatorFunctionsUrl = 'http://192.168.1.15:5001/owm-a12-fb/us-central1';
const localEmulatorFunctionsUrlContainer = 'http://192.168.1.15:5001/owm-a12-fb/us-central1';

export const environment = {
  production: false,
  name: 'dev',
  emulator,
  firebase: emulator ? (container ? firebaseEmulatorContainer : firebaseEmulator) : firebaseConfigDevEnv,
  'functions': emulator ? (container ? localEmulatorFunctionsUrlContainer : localEmulatorFunctionsUrl) : firebaseFunctionsUrl,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
