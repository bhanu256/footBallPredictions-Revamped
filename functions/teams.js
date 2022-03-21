const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;

// function to additional data
exports.fetchAdditionalData = functions.firestore
  .document("sportmonks/{leagueID}")
  .onCreate(async (snap, context) => {
    const snapData = snap.data();

    const localTeamData = await getTeamData(snapData.localteam_id);
    const visitorTeamData = await getTeamData(snapData.visitorteam_id);
    const leagueData = await getLeagueData(snapData.league_id);
    const predictions = await getPredictionsData(snapData.id);

    snapData.localTeamData = localTeamData;
    snapData.visitorTeamData = visitorTeamData;
    snapData.leagueData = leagueData;
    snapData.predictions = predictions;
    return admin.firestore().doc("sportmonks/"+context.params.leagueID).set(snapData, {merge: true});
  });


  // Function to retrieve teams
async function getTeamData(id) {
  return axios
  .get(
    "https://soccer.sportmonks.com/api/v2.0/teams/" + // Api
      id +
      "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA" // auth token
  )
  .then(async function (response) {
    const data = response.data.data;

    return data;
  })
  .catch(function (error) {
    functions.logger.error(error);
  });
}

// Function to retrieve league data
async function getLeagueData(id) {
  return axios
  .get(
    "https://soccer.sportmonks.com/api/v2.0/leagues/" + // Api
      id +
      "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA" // auth token
  )
  .then(async function (response) {
    const data = response.data.data;

    return data;
  })
  .catch(function (error) {
    functions.logger.error(error);
  });
}

// Function to retrieve league data
async function getPredictionsData(id) {
  return axios
  .get(
    "https://soccer.sportmonks.com/api/v2.0/predictions/probabilities/fixture/" + // Api
          id +
          "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA" // auth token
  )
  .then(async function (response) {
    const data = response.data.data;

    return data.predictions;
  })
  .catch(function (error) {
    functions.logger.error(error);
  });
}

  // function to fetch Visitor Team Details
// exports.fetchVisitorTeamNames = functions.firestore
//   .document("sportmonks/{leagueID}")
//   .onCreate((snap, context) => {
//     const data = snap.data();

//     return axios
//       .get(
//         "https://soccer.sportmonks.com/api/v2.0/teams/" + // Api
//           data.visitorteam_id +
//           "?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA" // auth token
//       )
//       .then(function (response) {
//         const data = response.data.data;

//          return admin
//            .firestore()
//            .doc("teams/" + data.id)
//            .set(data);

//         snapData.visitorTeamData = data;
//         return admin.firestore().doc("sportmonks/"+context.params.leagueID).set(snapData, {merge: true});
//       })
//       .catch(function (error) {
//         functions.logger.error(error);
//       });
//   });
