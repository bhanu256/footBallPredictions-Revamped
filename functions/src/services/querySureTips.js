const functions = require('firebase-functions');
const {getFirestore} = require('firebase-admin/firestore');

const db = getFirestore();
const colRef = db.collection('fixtures');

/* End Points */

exports.getSureTips = functions.https.onRequest(async (req, res) => {
  const lastDocID = req.query.lastDocID;
  const percentage = req.query.percentage ? Number(req.query.percentage) : 85;

  let startAtSnap;
  if (lastDocID) {
    const lastDocRef = colRef.doc(lastDocID);
    const lastDocSnap = await lastDocRef.get();

    startAtSnap = colRef
        .where('maximumValue', '>=', percentage)
        .orderBy('maximumValue')
        .orderBy('date.date', 'desc')
        .orderBy('date.time')
        .startAfter(lastDocSnap);
  } else {
    startAtSnap = colRef
        .where('maximumValue', '>=', percentage)
        .orderBy('maximumValue')
        .orderBy('date.date', 'desc')
        .orderBy('date.time');
  }

  const dataSet = [];
  const items = await startAtSnap.limit(5).get();
  items.docs.forEach(async (doc) => {
    dataSet.push(doc.data());
  });

  const querySnapShot = await colRef.get();
  const count = querySnapShot.docs.length;
  const meta = {
    count: count,
  };

  res.send({
    items: dataSet,
    meta: meta,
  });
});
