/* eslint-disable no-undef */
import fetch from 'node-fetch';

//& serverless func handle feedback submissions & proxy to airtable
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'method not allowed' }),
    };
  }

  const apiKey = process.env.VITE_AIRTABLE_API_KEY;
  const baseId = process.env.VITE_AIRTABLE_BASE_ID;
  const tableName = process.env.VITE_AIRTABLE_TABLE_FEEDBACK;

  if (!apiKey || !baseId || !tableName) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'missing airtable environment variables' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'invalid json body' }),
    };
  }

  const {
    name,
    email,
    dateOfBirth,
    rating,
    improvementAreas,
    bugReport,
    additionalFeedback,
    userId,
  } = payload;

  if (!name || !email || rating == null || !improvementAreas) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'missing required fields' }),
    };
  }

  const userAgent = event.headers['user-agent'] || '';
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || '';

  const fields = {
    Name: name,
    Email: email,
    Rating: rating,
    'Improvement Areas': improvementAreas,
    'User Agent': userAgent,
    'IP Address': ip,
  };

  if (dateOfBirth) fields['Date of Birth'] = dateOfBirth;
  if (bugReport) fields['Bug Report'] = bugReport;
  if (additionalFeedback) fields['Additional Feedback'] = additionalFeedback;
  if (userId) fields['User ID'] = userId;

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: data.error || 'airtable error', details: data }),
      };
    }
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'failed to submit to airtable', details: err.message }),
    };
  }
};
