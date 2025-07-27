import https from 'https';

function testSecurityHeaders() {
  const options = {
    hostname: 'web-payback-tokenizer.replit.app',
    path: '/api/security/headers/test',
    method: 'GET',
    headers: {
      'Origin': 'https://malicious-site.com'
    }
  };

  const req = https.request(options, (res) => {
    console.log('🔒 SECURITY HEADERS TEST RESULTS');
    console.log('=====================================');
    console.log(`Status Code: ${res.statusCode}`);
    console.log('\n📋 Security Headers:');
    console.log(`Content-Security-Policy: ${res.headers['content-security-policy'] || 'MISSING'}`);
    console.log(`Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'MISSING'}`);
    console.log(`X-Frame-Options: ${res.headers['x-frame-options'] || 'MISSING'}`);
    console.log(`X-Content-Type-Options: ${res.headers['x-content-type-options'] || 'MISSING'}`);
    console.log(`Strict-Transport-Security: ${res.headers['strict-transport-security'] || 'MISSING'}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n📊 Response Data:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('\n📊 Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request failed:', e.message);
  });

  req.end();
}

console.log('🧪 Testing WebPayback security improvements...\n');
testSecurityHeaders();