/* eslint-env node */
/* eslint-disable no-undef */
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  //~ allow only get requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: 'method not allowed' })
    };
  }

  const apiKey = process.env.VITE_FOOTBALL_DATA_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: 'missing api key' })
    };
  }

  //& build target url (optionally allow league as param)
  const league = event.queryStringParameters?.league || 'PL';
  const url = `https://api.football-data.org/v4/competitions/${league}/standings`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey
      }
    });
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'access-control-allow-origin': '*',
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: 'failed to fetch football data', details: err.message })
    };
  }
};
