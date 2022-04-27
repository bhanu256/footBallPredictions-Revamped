const functions = require('firebase-functions');
const {getFirestore} = require('firebase-admin/firestore');

const db = getFirestore();
const colRef = db.collection('subsPurchases');

exports.verifySubsPurchases = functions.https.onRequest(async (req, res) => {
  const purchaseOrderInfo = {
    purchaseToken: req.query.purchaseToken,
    orderId: req.query.orderId,
    purchaseItem: req.query.purchaseItem,
    isValid: false,
  };

  try {
    await colRef.doc(purchaseOrderInfo.purchaseToken.toString())
        .set(purchaseOrderInfo);

    res.send({status: 'success'});
  } catch (err) {
    res.send(JSON.stringify(err)).status(500);
  }
});
