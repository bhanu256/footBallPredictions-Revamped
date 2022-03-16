const league = require("./league");
const teams = require("./teams");
const probability = require("./probabilities");
const query = require("./queryFixture");
const sureTips = require("./querySureTips");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;
const { firestore } = require("firebase-admin");
admin.initializeApp();

exports.verifySubsPurchases = functions.https.onRequest((req, res) => {
  var purchaseOrderInfo = {
    purchaseToken: req.query.purchaseToken,
    orderId: req.query.orderId,
    purchaseItem: req.query.purchaseItem,
    isValid: false,
  };

  var firestore = admin.firestore();

  firestore
    .doc("subsPurchases/" + purchaseOrderInfo.purchaseToken)
    .get()
    .then((result) => {
      if (result.exists) {
        res.send(purchaseOrderInfo);
      } else {
        purchaseOrderInfo.isValid = true;
        firestore
          .doc("subsPurchases/" + purchaseOrderInfo.purchaseToken)
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
  var firestore = admin.firestore();

  // Append tispster type
  obj.tipster = 0;

  const dbResponse = await firestore
    .doc("sportmonks/" + obj.id)
    .get()
    .then((result) => {
      if (!result.exists) {
        firestore
          .doc("sportmonks/" + obj.id)
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
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  var date = yyyy + "-" + mm + "-" + dd;

  data = "2021-10-01";

  const apiResponse = await axios
    .get(
      "https://soccer.sportmonks.com/api/v2.0/fixtures/date/" + date + "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA"
      // "https://soccer.sportmonks.com/api/v2.0/fixtures/date/" +
      //   date +
      //   "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA"
    )
    .then(function (response) {
      const data = response.data.data;
      const pagination = response.data.meta.pagination;

      // update pages
      const currentPage = pagination["current_page"];
      const totalPages = pagination["total_pages"];

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
    .catch(function (error) {
      functions.logger.error(error);
    });

  return dt;
}

async function deleteSportMonksCollection() {
  const firestore = admin.firestore();
  const batch = firestore.batch();

  firestore
    .collection("sportmonks")
    .listDocuments()
    .then((docs) => {
      docs.map((doc) => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        var date = yyyy + "-" + mm + "-" + (Number(dd)-2);

        const lastDate = new Date(date);
        const data = doc.data();
        console.log(data);
        const objDate = new Date(data.time.starting_at.date);

        if (objDate > lastDate) {
          batch.delete(doc)
        }
      });

      return batch.commit();
    });
}

exports.fetchFixturesByDate = functions.https.onRequest((req, res) => {
  const currentPage = 1;
  const totalPages = 2;
  const dt = [];

  // Delete existing docs
  deleteSportMonksCollection()
    .then(() => {
      // Populate collection
      fetchFixturesFromAPI(dt)
        .then(() => {
          res.send({ status: "success" });
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
  .schedule("0 */12 * * *")
  .timeZone("Europe/London")
  .onRun(() => {
    const currentPage = 1;
    const totalPages = 2;
    const dt = [];

    deleteSportMonksCollection()
      .then(() => {
        // Populate collection
        fetchFixturesFromAPI(dt)
          .then(() => {
            functions.logger.log("Scheduler ran successfully");
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

exports.updateLocalTeamsCollection = teams.fetchLocalTeamNames;

exports.updateVisitorTeamsCollection = teams.fetchVisitorTeamNames;

exports.updateFixtureProbabilities = probability.fetchFixtureProbabilities;

exports.getFixtures = query.getFixtures;

exports.getLeagueNames = query.getLeagueNames;

exports.getTeamNames = query.getTeamNames;

exports.getSportMonksFixturesSize = query.getSportMonksFixturesSize;

exports.getLeagueNames = query.getLeagueNames;

exports.getTeamNames = query.getTeamNames;

exports.getSureTips = sureTips.getSureTips;

// exports.appendData = functions.https.onRequest((req, res) => {
//   const today = new Date();
//   const dd = String(today.getDate()).padStart(2, "0");
//   const mm = String(today.getMonth() + 1).padStart(2, "0");
//   const yyyy = today.getFullYear();
//   var date = yyyy + "-" + mm + "-" + dd;

//   date = "2021-10-30";

//   const apiResponse = axios
//     .get(
//       "https://soccer.sportmonks.com/api/v2.0/fixtures/date/" +
//         date +
//         "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA"
//     )
//     .then(function (response) {
//       const data = response.data.data;
//       const pagination = response.data.meta.pagination;

//       // update pages
//       const currentPage = pagination["current_page"];
//       const totalPages = pagination["total_pages"];

//       let i = 1;
//       // loop through data
//       for (const obj of data) {
//         const dbResponse = admin.firestore()
//           .doc("sportmonks/" + i++)
//           .set(obj)
//           .then(() => {
//             i = i + 1;
//           })
//           .catch((error) => {
//             functions.logger.error(error);
//           });
//       }

//       res.send(data);
//     })
//     .catch(function (error) {
//       functions.logger.error(error);
//     });
// });
