const https = require('https');

const KEY = '4c744a71e6a34448af7ef9bf3d69a264';

exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const endpoint = (event.queryStringParameters || {}).endpoint || '';
  if (!endpoint) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'endpoint manquant' }) };
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.football-data.org',
        path: '/v4' + endpoint,
        method: 'GET',
        headers: { 'X-Auth-Token': KEY }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
          catch(e) { resolve({ status: res.statusCode, body: {} }); }
        });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });

    return { statusCode: result.status, headers: CORS, body: JSON.stringify(result.body) };

  } catch(err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
