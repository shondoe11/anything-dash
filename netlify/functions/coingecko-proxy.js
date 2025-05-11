// removed unused eslint-disable
import fetch from 'node-fetch';

export const handler = async (event) => {
  //~ only allow GET reqs
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  //& build target URL frm endpoint & query params
  const params = event.queryStringParameters || {};
  const { endpoint, ...rest } = params;
  const baseUrl = 'https://api.coingecko.com/api/v3';
  let url = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;

  const entries = Object.entries(rest);
  if (entries.length > 0) {
    const qp = new URLSearchParams();
    for (const [key, val] of entries) {
      qp.append(key, val);
    }
    url += `?${qp.toString()}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      statusCode: response.status,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
