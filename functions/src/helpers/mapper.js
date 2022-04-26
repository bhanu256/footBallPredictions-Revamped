/* eslint-disable require-jsdoc */
const services = require('./services');

async function mapResponseToObject(response) {
  const id = response.id ? response.id : null;
  const date = response.time.starting_at ? response.time.starting_at : {};
  const localTeam = await services.getTeamData(response.localteam_id);
  const visitorTeam = await services.getTeamData(response.visitorteam_id);
  const league = await services.getLeagueData(response.league_id);
  const predictions = await services.getPredictionsData(response.id);

  const obj = {
    id: id,
    date: date,
    localTeam: localTeam,
    visitorTeam: visitorTeam,
    league: league,
    predictions: predictions,
  };

  return obj;
}

exports.mapResponseToObject = (response) => {
  return mapResponseToObject(response);
};
