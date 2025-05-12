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

  //& server-side chunking fr simple/token_price endpoint
  if (endpoint.startsWith('simple/token_price/') && rest.contract_addresses) {
    try {
      const { contract_addresses, ...otherParams } = rest;
      const addresses = contract_addresses.split(',');
      const chunkSize = 2; //~ chunk size avoid errors
      const aggregated = {};
      for (let i = 0; i < addresses.length; i += chunkSize) {
        const chunk = addresses.slice(i, i + chunkSize);
        const qp2 = new URLSearchParams(otherParams);
        qp2.set('contract_addresses', chunk.join(','));
        const chunkUrl = `${baseUrl}/${endpoint}?${qp2.toString()}`;
        try {
          const resp = await fetch(chunkUrl);
          if (!resp.ok) {
            console.warn(`Chunk fetch error for ${chunk.join(',')}: ${resp.status}`);
            continue;
          }
          const data = await resp.json();
          Object.assign(aggregated, data);
        } catch (err) {
          console.error(`Chunk fetch exception for ${chunk.join(',')}:`, err);
          continue;
        }
      }
      return {
        statusCode: 200,
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(aggregated)
      };
    } catch (err) {
      console.error('coingecko-proxy chunking error:', err);
      // fallback to default fetch
    }
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
