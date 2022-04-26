const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios').default;

// main function
// TODO: change to crons
exports.fetchLeagueNames = functions.https.onRequest((req, res) => {
  // Delete existing docs
  deleteLeagueCollection()
      .then(() => {
      // Populate collection
        getResponseFromLeagueAPI()
            .then(() => {
              res.send({status: 'success'});
            })
            .catch((err) => {
              res.send({status: err});
            });
      })
      .catch((error) => {
        functions.logger.error(error);
      });
});

exports.fetchLeagueNamesCron = functions.pubsub
    .schedule('0 */12 * * *')
    .timeZone('Europe/London')
    .onRun(() => {
    // deleteLeagueCollection()
    //   .then(() => {
      // Populate collection
      getResponseFromLeagueAPI()
          .then(() => {
            functions.logger.log(
                'Fetch League Names Scheduler ran successfully',
            );
          })
          .catch((err) => {
            functions.logger.error(err);
          });
      // })
      // .catch((error) => {
      //   functions.logger.error(error);
      // });
    });

async function deleteLeagueCollection() {
  const firestore = admin.firestore();
  const batch = firestore.batch();

  firestore
      .collection('leagueNames')
      .listDocuments()
      .then((doc) => {
        doc.map((doc) => batch.delete(doc));

        return batch.commit();
      });
}

// calls third party api to fetch data
async function getResponseFromLeagueAPI() {
  await axios
      .get(
          'https://soccer.sportmonks.com/api/v2.0/leagues' + // Api
          '?api_token=' +
          'kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA',
      )
      .then(function(response) {
        const data = response.data.data;
        const pagination = response.data.meta.pagination;

        // update pages
        const currentPage = pagination['current_page'];
        const totalPages = pagination['total_pages'];

        // loop through data
        for (const obj of data) {
          updateDocToLeagueCollection(obj).then((res) => {
          // Response inserted
          });
        }

        if (currentPage < totalPages) {
          getResponseFromLeagueAPI();
        }
      })
      .catch(function(error) {
        functions.logger.error(error);
      });
}

// updates data to collection
async function updateDocToLeagueCollection(obj) {
  const firestore = admin.firestore();

  await firestore
      .doc('leagueNames/' + obj.id)
      .get()
      .then((result) => {
        if (!result.exists) {
          firestore
              .doc('leagueNames/' + obj.id)
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
