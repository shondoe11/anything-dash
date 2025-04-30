/* eslint-env node */
/* global process */
import fetch from 'node-fetch';

export const handler = async function(event) {
  const { city, dt } = event.queryStringParameters || {};
  const apiKey = process.env.VITE_WEATHERAPI_KEY;
  const url = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${encodeURIComponent(city)}&dt=${dt}&lang=en`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: response.statusText }),
      };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
