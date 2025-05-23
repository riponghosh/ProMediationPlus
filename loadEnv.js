// c:\Users\dubli\Desktop\PROMEDIATION\loadEnv.js
import dotenv from 'dotenv';
import path from 'path';

// Resolve .env path from project root (where npm run commands are executed)
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[loadEnv.js] Error loading .env file:', result.error);
  // You might want to throw the error or exit if .env is critical
  // throw result.error; 
} else {
  console.log('[loadEnv.js] .env file loaded. Variables found:', Object.keys(result.parsed || {}));
}
