const axios = require('axios').default;

function getTeamData(id) {
  const url = `https://soccer.sportmonks.com/api/v2.0/teams/${id}?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA`;

  return axios
      .get(url)
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
}
exports.getTeamData = (id) => {
  return getTeamData(id);
};

function getLeagueData(id) {
  const url = `https://soccer.sportmonks.com/api/v2.0/leagues/${id}?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA`;

  return axios
      .get(url)
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
}
exports.getLeagueData = (id) => {
  return getLeagueData(id);
};

function getPredictionsData(id) {
  const url = `https://soccer.sportmonks.com/api/v2.0/predictions/probabilities/fixture/${id}?api_token=kLCL2pwPxb6Fq04qwcYkNFAYclNk7RyVfy3QYTyiV34lU6yieEIT6nyocPuA`;

  return axios
      .get(url)
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
}
exports.getPredictionsData = (id) => {
  return getPredictionsData(id);
};
