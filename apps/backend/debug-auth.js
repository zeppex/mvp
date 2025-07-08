const jwt = require('jsonwebtoken');

// Your token from the curl response
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1cGVyYWRtaW5AemVwcGV4LmNvbSIsInN1YiI6IjAxOTc4NTk2LTJmN2QtNzI5Yy05YWQzLTdhMzM3ODczOWE5MSIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzUxOTM1NzkyLCJleHAiOjE3NTE5MzY2OTJ9.6v3KqontS8U3y3j9EF3iB1MTmWpCBVTyta0JZhNHtmQ';

// Decode the token (without verification)
const decoded = jwt.decode(token);
console.log('Token payload:', JSON.stringify(decoded, null, 2));

// Check if token is expired
const now = Math.floor(Date.now() / 1000);
console.log('Current time:', now);
console.log('Token expires at:', decoded.exp);
console.log('Is expired:', now > decoded.exp);

// Check the time difference
const timeDiff = decoded.exp - now;
console.log('Time until expiration (seconds):', timeDiff);
console.log('Time until expiration (minutes):', timeDiff / 60);
