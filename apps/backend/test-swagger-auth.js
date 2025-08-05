const http = require('http');

function makeRequest(method, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST') {
      req.write('{}');
    }
    req.end();
  });
}

async function testSwaggerAuth() {
  console.log('Testing Swagger Authentication for Treasury endpoints...\n');

  try {
    // Test 1: Try to access create-token without JWT (should fail)
    console.log('1. Testing create-token endpoint without JWT token...');
    try {
      const response = await makeRequest('POST', '/treasury/create-token');
      console.log(
        '❌ Unexpected success - endpoint should require authentication',
      );
      console.log(`   Status: ${response.status}`);
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }

    // Test 2: Try to access token-info without JWT (should fail)
    console.log('\n2. Testing token-info endpoint without JWT token...');
    try {
      const response = await makeRequest('GET', '/treasury/token-info');
      console.log(
        '❌ Unexpected success - endpoint should require authentication',
      );
      console.log(`   Status: ${response.status}`);
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }

    // Test 3: Check if Swagger docs show authentication requirement
    console.log('\n3. Checking Swagger documentation...');
    try {
      const response = await makeRequest('GET', '/docs');
      if (
        response.data.includes('Authorization') ||
        response.data.includes('Bearer')
      ) {
        console.log(
          '✅ Swagger docs appear to include authentication information',
        );
      } else {
        console.log(
          '⚠️  Swagger docs may not show authentication requirements',
        );
      }
    } catch (error) {
      console.log('❌ Could not access Swagger documentation:', error.message);
    }

    console.log('\n📋 Summary:');
    console.log('- Treasury endpoints should require JWT authentication');
    console.log(
      '- Swagger documentation should show the Authorization header requirement',
    );
    console.log('- You can test with a valid JWT token by:');
    console.log('  1. Getting a token from /api/v1/auth/login');
    console.log('  2. Using it in the Authorization header: Bearer <token>');
    console.log('  3. Testing the create-token endpoint');
    console.log('\n🔗 Swagger UI: http://localhost:4000/api/v1/docs');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSwaggerAuth().catch(console.error);
