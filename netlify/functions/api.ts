import serverless from 'serverless-http';
import { app } from '../../app';

// Serverless entrypoint for Netlify Functions (routes /api/* to Express)
export const handler = serverless(app);
