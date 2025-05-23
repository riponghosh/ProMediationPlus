console.log('--- [SERVER] Starting with dotenv, cors, express.json ---');

process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('[SERVER] Uncaught Exception thrown:', error);
  process.exit(1);
});

console.log('--- [SERVER] Global error handlers registered ---');

import express, { Request, Response } from 'express';
import cors from 'cors';
import calendlyAuthRoutes from './src/api/calendlyAuthRoutes.js';
import calendlyApiRoutes from './src/api/calendlyApiRoutes.js';

console.log('--- [SERVER] Basic imports loaded (including cors) ---'); // Updated log

const app = express();
const port = process.env.BACKEND_PORT || 3001;

// Enable CORS for all routes
app.use(cors());
console.log('--- [SERVER] CORS middleware enabled ---'); // Added log

// Middleware to parse JSON bodies
app.use(express.json()); // For parsing application/json
console.log('--- [SERVER] express.json middleware enabled ---'); // Added log

// Add Calendly routes
app.use('/api/calendly', calendlyAuthRoutes);
app.use('/api/calendly-api', calendlyApiRoutes); // Corrected path

console.log(`--- [SERVER] Express app initialized. Attempting to listen on port: ${port} ---`);

app.get('/health', (req: Request, res: Response) => {
  console.log('[SERVER] GET /health hit');
  res.status(200).json({ status: 'ok', message: 'Server with dotenv, cors, express.json is running' }); // Updated message
});

app.listen(port, () => {
  console.log(`--- [SERVER] Backend server listening at http://localhost:${port} ---`);
});

console.log('--- [SERVER] Finished initial synchronous execution ---');

// Keep the process alive for a bit
setTimeout(() => {
    console.log("--- [SERVER] Still alive after 10 seconds. ---");
}, 10000);