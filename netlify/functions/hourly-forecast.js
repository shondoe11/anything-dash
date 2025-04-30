/* eslint-disable no-undef, no-unused-vars */
//* Proxy NEA 24-hour hourly forecast: bypass CORS
import fetch from 'node-fetch';

export const handler = async function(event, context) {
  try {
    //~ fetch 24h forecast frm NEA
    const res = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast');
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};