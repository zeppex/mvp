require('dotenv').config();

console.log('Environment variables test:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
console.log(
  'JWT_SECRET preview:',
  process.env.JWT_SECRET
    ? `${process.env.JWT_SECRET.substring(0, 20)}...`
    : 'undefined',
);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
