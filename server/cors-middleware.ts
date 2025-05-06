import { Request, Response, NextFunction } from 'express';

/**
 * Custom CORS middleware that properly handles credentials
 * This is especially important for authentication
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Set CORS headers
  const origin = req.headers.origin || '';
  
  // For authentication to work, we must use a specific origin (not wildcard)
  // when credentials are included
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}