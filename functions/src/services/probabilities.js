const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios').default;

// function to fetch Local Team Details
exports.fetchFixtureProbabilities = functions.firestore
    .document('sportmonks/{leagueID}')
    .onCreate((snap, context) => {
      const data = snap.data();

      return axios
          .get(
              'https://soccer.sportmonks.com/api/v2.0/predictions/probabilities/fixture/' + // Api
              data.id + '?api_token=' +
              'kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA',
          )
          .then(function(response) {
            const data = response.data.data;

            return admin
                .firestore()
                .doc('sportmonks/' + data.fixture_id)
                .update({'predictions': data.predictions});
          })
          .catch(function(error) {
            functions.logger.error(error);
          });
    });
