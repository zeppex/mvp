const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api/v1';

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow Implementation...\n');

  try {
    // Step 1: Login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'superadmin@zeppex.com',
      password: 'SuperAdmin!123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Step 2: Create a merchant
    console.log('2. Creating a merchant...');
    const merchantResponse = await axios.post(
      `${API_BASE_URL}/merchants`,
      {
        name: 'Test Merchant',
        address: '123 Test Street',
        contact: 'test@merchant.com',
        contactName: 'Test Contact',
        contactPhone: '+1234567890',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const merchantId = merchantResponse.data.id;
    console.log(`✅ Merchant created: ${merchantId}\n`);

    // Step 3: Create a branch
    console.log('3. Creating a branch...');
    const branchResponse = await axios.post(
      `${API_BASE_URL}/merchants/${merchantId}/branches`,
      {
        name: 'Test Branch',
        address: '456 Branch Ave',
        contactName: 'Branch Manager',
        contactPhone: '+1234567891',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const branchId = branchResponse.data.id;
    console.log(`✅ Branch created: ${branchId}\n`);

    // Step 4: Create a POS
    console.log('4. Creating a POS...');
    const posResponse = await axios.post(
      `${API_BASE_URL}/merchants/${merchantId}/branches/${branchId}/pos`,
      {
        name: 'Test POS',
        description: 'Test Point of Sale',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const posId = posResponse.data.id;
    console.log(`✅ POS created: ${posId}`);
    console.log(`   Payment Link: ${posResponse.data.paymentLink}\n`);

    // Step 5: Get QR code information
    console.log('5. Getting QR code information...');
    const qrCodeResponse = await axios.get(
      `${API_BASE_URL}/merchants/${merchantId}/branches/${branchId}/pos/${posId}/qr-code`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log('✅ QR Code information:');
    console.log(`   URL: ${qrCodeResponse.data.qrCodeUrl}`);
    console.log(`   Image URL: ${qrCodeResponse.data.qrCodeImageUrl}\n`);

    // Step 6: Create a payment order
    console.log('6. Creating a payment order...');
    const orderResponse = await axios.post(
      `${API_BASE_URL}/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders`,
      {
        amount: '25.50',
        description: 'Test payment order',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const orderId = orderResponse.data.id;
    console.log(`✅ Payment order created: ${orderId}`);
    console.log(`   Amount: $${orderResponse.data.amount}`);
    console.log(`   Status: ${orderResponse.data.status}`);
    console.log(`   Expires at: ${orderResponse.data.expiresAt}\n`);

    // Step 7: Test public endpoint (get current order)
    console.log('7. Testing public endpoint (get current order)...');
    const currentOrderResponse = await axios.get(
      `${API_BASE_URL}/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
    );

    console.log('✅ Public endpoint response:');
    console.log(`   Amount: $${currentOrderResponse.data.amount}`);
    console.log(`   Status: ${currentOrderResponse.data.status}`);
    console.log(`   Expires in: ${currentOrderResponse.data.expiresIn}ms\n`);

    // Step 8: Trigger in-progress status
    console.log('8. Triggering in-progress status...');
    const triggerResponse = await axios.post(
      `${API_BASE_URL}/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/${orderId}/trigger-in-progress`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log('✅ In-progress triggered:');
    console.log(`   Status: ${triggerResponse.data.status}\n`);

    console.log(
      '🎉 All tests passed! Payment flow implementation is working correctly.',
    );
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testPaymentFlow();
