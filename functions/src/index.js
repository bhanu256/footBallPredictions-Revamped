// import { initializeApp } from 'firebase-admin';

const firebase = require('firebase-admin');

// Configs
const firebaseConfig = {
  apiKey: 'AIzaSyDRaqIDC3KkY8BdQsu7hq4TBXohOf7ebQI',
  authDomain: 'footballpredictions-3603f.firebaseapp.com',
  projectId: 'footballpredictions-3603f',
  storageBucket: 'footballpredictions-3603f.appspot.com',
  messagingSenderId: '851804558632',
  appId: '1:851804558632:web:954f637edd41ba1708ac1d',
  measurementId: 'G-0KR0ELVZ46',
};
firebase.initializeApp(firebaseConfig);

const fixtures = require('./services/fixtures');
const queryFixtures = require('./services/queryFixtures');
const sureTips = require('./services/querySureTips');
const purchases = require('./services/purchases');

exports.verifySubsPurchases = purchases.verifySubsPurchases;

exports.fetchFixturesByTrigger = fixtures.fetchFixturesByTrigger;

exports.fetchFixtures = fixtures.fetchFixtures;

exports.updateMaxValue = fixtures.updateMaxValue;

exports.getSureTips = sureTips.getSureTips;

exports.getFixtures = queryFixtures.getFixtures;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', {structuredData: true});
//   response.send('Hello from Firebase!');
// });
