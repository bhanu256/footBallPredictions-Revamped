const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;

// function to fetch Local Team Details
exports.fetchLocalTeamNames = functions.firestore
  .document("fixtures/{leagueID}")
  .onCreate((snap, context) => {
    const data = snap.data();

    return axios
      .get(
        "https://soccer.sportmonks.com/api/v2.0/teams/" + // Api
          data.localteam_id +
          "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA" // auth token
      )
      .then(function (response) {
        const data = response.data.data;

        return admin
          .firestore()
          .doc("teams/" + data.id)
          .set(data);
      })
      .catch(function (error) {
        functions.logger.error(error);
      });
  });

  // function to fetch Visitor Team Details
exports.fetchVisitorTeamNames = functions.firestore
  .document("fixtures/{leagueID}")
  .onCreate((snap, context) => {
    const data = snap.data();

    return axios
      .get(
        "https://soccer.sportmonks.com/api/v2.0/teams/" + // Api
          data.visitorteam_id +
          "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA" // auth token
      )
      .then(function (response) {
        const data = response.data.data;

        return admin
          .firestore()
          .doc("teams/" + data.id)
          .set(data);
      })
      .catch(function (error) {
        functions.logger.error(error);
      });
  });
