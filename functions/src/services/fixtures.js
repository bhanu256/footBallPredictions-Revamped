/* eslint-disable no-unused-vars */
const axios = require('axios').default;
const functions = require('firebase-functions');
const {getFirestore} = require('firebase-admin/firestore');

const utils = require('../helpers/utils');
const mapper = require('../helpers/mapper');

const db = getFirestore();
const colRef = db.collection('fixtures');
const date = utils.getTodaysDate();
const twoDaysBackDate = utils.getTwoDaysBackDate();

/* Endpoints */

exports.fetchFixturesByTrigger = functions.https.onRequest(async (req, res) => {
  try {
    const response = await deleteExistingAndFetchFixtures();
    res.status(200);
    res.send(response);
  } catch (e) {
    functions.logger.error(e);
    res.status(500);
    res.send({'code': e});
  }
});

exports.fetchFixtures = functions.pubsub
    .schedule('0 */12 * * *')
    .onRun(async () => {
      try {
        await deleteExistingAndFetchFixtures();
      } catch (e) {
        functions.logger.error(e);
      }
    });

exports.updateMaxValue = functions.firestore
    .document('fixtures/{id}')
    .onCreate(async (snap, context) => {
      const data = snap.data();
      const maxValue = await utils
          .getMaximumPredictionValue(data.predictions.predictions);

      return snap.ref.update({
        maximumValue: maxValue,
      });
    });


/* Helper Functions */

async function deleteExistingAndFetchFixtures() {
  await deleteFixtures();
  await fetchFixtures();

  // await insertDummyData();

  return {};
}

async function deleteFixtures() {
  const snapshot = await colRef.get();

  snapshot.forEach(async (item) => {
    const data = item.data();

    const condDate = new Date(twoDaysBackDate).toISOString().split('T')[0];
    const objDate = new Date(data.date.date).toISOString().split('T')[0];

    if (objDate < condDate) {
      await colRef.doc(item.id).delete();
    }
  });
}

async function fetchFixtures() {
  const url = `https://soccer.sportmonks.com/api/v2.0/fixtures/date/${date}?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA`;

  return axios.get(url).then(async (response) => {
    const items = response.data.data;

    for (const item of items) {
      const obj = await mapper.mapResponseToObject(item);

      if (utils.isItemValid(obj)) {
        await insertFixtures(obj);
      }
    }
  }).catch((err) => {
    throw new Error(JSON.stringify(err));
  });
}

async function insertFixtures(obj) {
  const docRef = colRef.doc(obj.id.toString());

  await docRef.set(obj);
}

async function insertDummyData() {
  for (let i=0; i<30; i++) {
    const obj = {
      index: i,
      date: {
        date: '2022-04-26',
        time: '13:00:00',
      },
    };

    await colRef.doc(i.toString()).set(obj);
  }
}
