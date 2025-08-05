// Global test setup for E2E tests
import { getConnection } from 'typeorm';

// Global teardown to ensure database connections are closed
afterAll(async () => {
  try {
    const connection = getConnection();
    if (connection.isConnected) {
      await connection.close();
    }
  } catch (error) {
    // Connection might already be closed
    console.log('Database connection cleanup:', error.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
