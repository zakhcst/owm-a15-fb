const firebaseFunctionsUrl = 'https://us-central1-owm-a7-fb.cloudfunctions.net';

export const environment = {
  production: true,
  name: 'prod',
  firebase: {
    apiKey: 'AIzaSyCT-Uab-tDlXLBKzWdv7rq4exZchMDRyR8',
    authDomain: 'owm-a7-fb.firebaseapp.com',
    databaseURL: 'https://owm-a7-fb.firebaseio.com',
    projectId: 'owm-a7-fb',
    storageBucket: 'owm-a7-fb.appspot.com',
    messagingSenderId: '1062734348256'
  },
  'functions': firebaseFunctionsUrl
};
