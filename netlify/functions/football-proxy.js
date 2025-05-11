/* eslint-disable no-undef */
import fetch from 'node-fetch';

export const handler = async (event) => {
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

  //& build target url (handle endpoint, league, & params)
  const params = event.queryStringParameters || {};
  const { endpoint, league } = params;
  let urlPath = endpoint ? endpoint : `competitions/${league || 'PL'}/standings`;
  let url = `https://api.football-data.org/v4/${urlPath}`;
  if (params.params) {
    const queryString = decodeURIComponent(params.params);
    url += `?${queryString}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey
      }
    });
    const data = await response.json();
    return {
      statusCode: response.ok ? 200 : 500,
      headers: { 'access-control-allow-origin': '*' },
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
