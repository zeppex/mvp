const jwt = require('jsonwebtoken');

// The JWT secret from your .env file
const JWT_SECRET =
  'your-super-secret-jwt-key-minimum-32-characters-long-change-this-in-production';

// A sample token from your login response
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1cGVyYWRtaW5AemVwcGV4LmNvbSIsInN1YiI6IjAxOTc4NTk2LTJmN2QtNzI5Yy05YWQzLTdhMzM3ODczOWE5MSIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzUxOTM2ODc4LCJleHAiOjE3NTE5Mzc3Nzh9.iQkKkLhFu8pH0ZGv8so6J3s1AvO4ulPRrDBkNESyQ9s';

try {
  // Verify the token
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Token is valid!');
  console.log('Decoded payload:', JSON.stringify(decoded, null, 2));

  // Check if the role matches the enum
  console.log('Role in token:', decoded.role);
  console.log('Expected role:', 'superadmin');
  console.log('Roles match:', decoded.role === 'superadmin');
} catch (error) {
  console.error('Token verification failed:', error.message);
}
