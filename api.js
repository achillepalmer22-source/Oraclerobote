const https = require('https');

exports.handler = async function(event) {
  const KEY = '1e7c6d6feemshcc250635ae6a2fcp16ec25jsnb2f6a31cc8e5';
  const endpoint = (event.queryStringParameters || {}).endpoint || '';

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (!endpoint) return { statusCode: 400, headers: CORS, body: JSON.stringify({error:'endpoint manquant'}) };

  try {
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api-football-v1.p.rapidapi.com',
        path: '/v3' + endpoint,
        method: 'GET',
        headers: {
          'x-rapidapi-key': KEY,
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
        }
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try { resolve({ code: res.statusCode, data: JSON.parse(body) }); }
          catch(e) { resolve({ code: res.statusCode, data: {} }); }
        });
      });
      req.on('error', reject);
      req.setTimeout(9000, () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });

    return { statusCode: result.code, headers: CORS, body: JSON.stringify(result.data) };

  } catch(err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({error: err.message}) };
  }
};
