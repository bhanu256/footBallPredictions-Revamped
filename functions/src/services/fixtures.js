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

exports.fetchFixturesByTrigger = functions
    .runWith({timeoutSeconds: 540}).https.onRequest(async (req, res) => {
      const next = req.query.next;

      try {
        const response = await deleteExistingAndFetchFixtures(next);
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
    .onCreate(async (snap, _context) => {
      const data = snap.data();
      const maxValue = await utils
          .getMaximumPredictionValue(data.predictions.predictions);

      return snap.ref.set({
        maximumValue: maxValue,
      }, {merge: true});
    });

exports.updateMaxValueOnUpdate = functions.firestore
    .document('fixtures/{id}')
    .onUpdate(async (change, _context) => {
      const data = change.after.data();
      const maxValue = await utils
          .getMaximumPredictionValue(data.predictions.predictions);

      return change.after.ref.set({
        maximumValue: maxValue,
      }, {merge: true});
    });


/* Helper Functions */

async function deleteExistingAndFetchFixtures(next) {
  await deleteFixtures();
  await fetchFixtures(next);

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

async function fetchFixtures(next) {
  let url = `https://soccer.sportmonks.com/api/v2.0/fixtures/date/${date}?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA`;

  if (next) {
    url = url.concat(`&page=${next}`);
  }

  return axios.get(url).then(async (response) => {
    const items = response.data.data;
    const paginationObj = response.data.meta.pagination;
    if (Object.prototype.hasOwnProperty.call(paginationObj.links, 'next')) {
      const nextNumber = paginationObj.links.next.split('?page=')[1];
      // axios.get(`http://127.0.0.1:5001/footballpredictions-3603f/us-central1/fetchFixturesByTrigger?next=${nextNumber}`);
      axios.get(`https://us-central1-footballpredictions-3603f.cloudfunctions.net/fetchFixturesByTrigger?next=${nextNumber}`);
    }

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
  await colRef.doc(obj.id.toString()).delete();

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
      maximumValue: 85,
    };

    await colRef.doc(i.toString()).set(obj);
  }
}
