import serverless from 'serverless-http';
import { app } from '../../server';

// Serverless entrypoint for Netlify Functions (routes /api/* to Express)
export const handler = serverless(app);
