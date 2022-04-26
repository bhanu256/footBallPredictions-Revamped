const league = require('./league');
const teams = require('./teams');
const query = require('./queryFixture');
const sureTips = require('./querySureTips');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios').default;
admin.initializeApp();

exports.verifySubsPurchases = functions.https.onRequest((req, res) => {
  const purchaseOrderInfo = {
    purchaseToken: req.query.purchaseToken,
    orderId: req.query.orderId,
    purchaseItem: req.query.purchaseItem,
    isValid: false,
  };

  const firestore = admin.firestore();

  firestore
      .doc('subsPurchases/' + purchaseOrderInfo.purchaseToken)
      .get()
      .then((result) => {
        if (result.exists) {
          res.send(purchaseOrderInfo);
        } else {
          purchaseOrderInfo.isValid = true;
          firestore
              .doc('subsPurchases/' + purchaseOrderInfo.purchaseToken)
              .set(purchaseOrderInfo)
              .then(() => {
                res.send(purchaseOrderInfo);
              });
        }
      })
      .catch((error) => {
        functions.logger.error(error);
      });
});

async function updateDocToCollection(obj) {
  const firestore = admin.firestore();

  // Append tispster type
  obj.tipster = 0;

  await firestore
      .doc('sportmonks/' + obj.id)
      .get()
      .then((result) => {
        if (!result.exists) {
          firestore
              .doc('sportmonks/' + obj.id)
              .set(obj)
              .then(() => {
                return obj;
              });
        }
      })
      .catch((error) => {
        functions.logger.error(error);
      });
}

async function fetchFixturesFromAPI(dt) {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const date = yyyy + '-' + mm + '-' + dd;

  await axios
      .get(
          'https://soccer.sportmonks.com/api/v2.0/fixtures/date/' + date + '?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA',
      )
      .then(function(response) {
        const data = response.data.data;
        const pagination = response.data.meta.pagination;

        // update pages
        const currentPage = pagination['current_page'];
        const totalPages = pagination['total_pages'];

        // loop through data
        for (const obj of data) {
          updateDocToCollection(obj).then((res) => {
            dt.push(res);
          });
        }

        if (currentPage < totalPages) {
          fetchFixturesFromAPI(dt);
        }
      })
      .catch(function(error) {
        functions.logger.error(error);
      });

  return dt;
}

async function deleteIfCond(snap) {
  const firestore = admin.firestore();
  const batch = firestore.batch();

  return snap.get().then(async (doc) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const date = yyyy + '-' + mm + '-' + (Number(dd)-2);

    const lastDate = new Date(date).toISOString().split('T')[0];
    const data = doc.data();
    const objDate = new Date(data.time.starting_at.date)
        .toISOString().split('T')[0];

    if (objDate < lastDate) {
      batch.delete(snap);
    }

    return await batch.commit();
  });
}

async function deleteSportMonksCollection() {
  const firestore = admin.firestore();
  const batch = firestore.batch();

  firestore
      .collection('sportmonks')
      .listDocuments()
      .then(async (docs) => {
        docs.forEach(async (snap) => {
          await deleteIfCond(snap, batch);
        });
      });
}

exports.fetchFixturesByDate = functions.https.onRequest((req, res) => {
  const dt = [];

  // Delete existing docs
  deleteSportMonksCollection()
      .then(() => {
      // Populate collection
        fetchFixturesFromAPI(dt)
            .then(() => {
              res.send({status: 'success'});
            })
            .catch((error) => {
              functions.logger.error(error);
            });
      })
      .catch((error) => {
        functions.logger.error(error);
      });
});

exports.fetchFixturesByDateCron = functions.pubsub
    .schedule('0 */12 * * *')
    .timeZone('Europe/London')
    .onRun(() => {
      const dt = [];

      deleteSportMonksCollection()
          .then(() => {
            // Populate collection
            fetchFixturesFromAPI(dt)
                .then(() => {
                  functions.logger.log('Scheduler ran successfully');
                })
                .catch((error) => {
                  functions.logger.error(error);
                });
          })
          .catch((error) => {
            functions.logger.error(error);
          });
    });

exports.fetchLeagueNames = league.fetchLeagueNames;

exports.fetchLeagueNamesCron = league.fetchLeagueNamesCron;

exports.fetchAdditionalData = teams.fetchAdditionalData;

// exports.updateLocalTeamsCollection = teams.fetchLocalTeamNames;

// exports.updateVisitorTeamsCollection = teams.fetchVisitorTeamNames;

// exports.updateFixtureProbabilities = probability.fetchFixtureProbabilities;

exports.getFixtures = query.getFixtures;

exports.getLeagueNames = query.getLeagueNames;

exports.getTeamNames = query.getTeamNames;

exports.getSportMonksFixturesSize = query.getSportMonksFixturesSize;

exports.getSureTips = sureTips.getSureTips;
