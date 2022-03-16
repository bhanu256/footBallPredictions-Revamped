const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;

async function doesRecordSatisfiesCondition(predictions, moreThanPer) {
  let satisfies = false;
  for (const pred in predictions) {
    if (typeof predictions[pred] == "number") {
      if (predictions[pred] >= moreThanPer) {
        satisfies = true;
        break;
      }
    }
  }

  return satisfies;
}

async function fetchSatisfiedRecords(query, moreThanPer) {
  let docs = [];
  return query
    .get()
    .then(async (result) => {
      for (doc of result.docs) {
        let canAdd = await doesRecordSatisfiesCondition(
          doc.data().predictions,
          moreThanPer
        );

        if (canAdd) {
          docs.push(doc.data());
        }

        if (docs.length == 5) {
          break;
        }
      }

      return docs;
    })
    .catch((error) => {
      return { status: "error" };
    });
}

exports.getSureTips = functions.https.onRequest(async (req, res) => {
  const docAt = req.query?.lastDocID;
  const moreThanPer = req.query?.percentage ? Number(req.query?.percentage) : 85;
  //const query = admin.firestore().collection("sportmonks").limit(5);

  try {
    admin
      .firestore()
      .collection("sportmonks")
      .doc(docAt)
      .get()
      .then(async (snap) => {
        const query = admin
          .firestore()
          .collection("sportmonks")
          .orderBy("id")
          .startAfter(snap || 0);

        let result = await fetchSatisfiedRecords(query, moreThanPer);
        functions.logger.log(result);
        res.send(result);
      })
      .catch((error) => {
        res.send([]);
      });
  } catch (error) {
    const query = admin
      .firestore()
      .collection("sportmonks")
      .orderBy("id")
      .startAfter(0);

    let result = await fetchSatisfiedRecords(query, moreThanPer);
    functions.logger.log(result);
    res.send(result);
  }

  
});