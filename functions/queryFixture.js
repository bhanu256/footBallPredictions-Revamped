const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;

exports.getSportMonksFixturesSize = functions.https.onRequest((req, res) => {
  const query = admin.firestore().collection("sportmonks");

  query
    .get()
    .then((result) => {
      res.send({ status: "success", count: result.docs.length });
    })
    .catch((error) => {
      res.send({ status: "error" });
    });
});

exports.getFixtures = functions.https.onRequest((req, res) => {
  const docAt = req.query.lastDocID;

  try {
    admin
      .firestore()
      .collection("sportmonks")
      .doc(docAt)
      .get()
      .then((snap) => {
        const query = admin
          .firestore()
          .collection("sportmonks")
          .orderBy("id")
          .startAfter(snap || 0)
          .limit(5);

        query
          .get()
          .then((result) => {
            res.send(result.docs.map((doc) => doc.data()));
          })
          .catch((error) => {
            functions.logger.error(error);
          });
      })
      .catch((error) => {
        res.send([]);
      });
  } catch (error) {
    const query = admin
      .firestore()
      .collection("sportmonks")
      .orderBy("id")
      .startAfter(0)
      .limit(5);

    query
      .get()
      .then((result) => {
        res.send(result.docs.map((doc) => doc.data()));
      })
      .catch((error) => {
        functions.logger.error(error);
      });
  }
});

exports.getLeagueNames = functions.https.onRequest((req, res) => {
  const query = admin.firestore().collection("leagueNames");

  query.get().then((result) => {
    res.send(result.docs.map((doc) => doc.data()));
  });
});

exports.getTeamNames = functions.https.onRequest((req, res) => {
  const query = admin.firestore().collection("teams");

  query.get().then((result) => {
    res.send(result.docs.map((doc) => doc.data()));
  });
});
