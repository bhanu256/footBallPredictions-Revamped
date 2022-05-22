function getTodaysDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  const date = yyyy + '-' + mm + '-' + dd;

  return date;
}
exports.getTodaysDate = () => {
  return getTodaysDate();
};


function getTwoDaysBackDate() {
  const todaysDate = getTodaysDate();

  const yyyy = todaysDate.split('-')[0];
  const mm = todaysDate.split('-')[1];
  const dd = Number(todaysDate.split('-')[2]) - 2;

  const date = yyyy + '-' + mm + '-' + dd;

  return date;
}
exports.getTwoDaysBackDate = () => {
  return getTwoDaysBackDate();
};

function isObjValid(obj) {
  return obj && Object.keys(obj).length > 0;
}

function isItemValid(item) {
  return (
    item.id !== null && isObjValid(item.date) &&
    isObjValid(item.localTeam) &&
    isObjValid(item.visitorTeam) &&
    isObjValid(item.league) &&
    isObjValid(item.predictions)
  );
}
exports.isItemValid = (item) => {
  return isItemValid(item);
};

async function getMaximumPredictionValue(predictions) {
  let maxValue = 0;
  for (const pred in predictions) {
    if (typeof predictions[pred] == 'number') {
      if (predictions[pred] > maxValue) {
        maxValue = Number(predictions[pred]);
      }
    }
  }

  return maxValue;
}
exports.getMaximumPredictionValue = (predictions, percentage) => {
  return getMaximumPredictionValue(predictions);
};
