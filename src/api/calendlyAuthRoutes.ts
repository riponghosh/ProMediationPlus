// src/api/calendlyAuthRoutes.ts
import express, { Request, Response, Router, NextFunction } from 'express';
import axios from 'axios';
import querystring from 'querystring';

const calendlyAuthRouter: Router = Router();

console.log('[calendlyAuthRoutes] CALENDLY_CLIENT_ID:', process.env.CALENDLY_CLIENT_ID);
console.log('[calendlyAuthRoutes] CALENDLY_CLIENT_SECRET:', process.env.CALENDLY_CLIENT_SECRET);

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID;
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET;
const CALENDLY_REDIRECT_URI = process.env.CALENDLY_REDIRECT_URI || 'http://localhost:5173/calendly/callback';

// Redirects user to Calendly's authorization page
// Path will be relative to /api/calendly, so this becomes /api/calendly/
calendlyAuthRouter.get('/', (req: Request, res: Response): void => {
  if (CALENDLY_CLIENT_ID === undefined) {
    console.error('[calendlyAuthRoutes] Critical Error: CALENDLY_CLIENT_ID is undefined. This means it was not found in process.env. Check .env file content and that loadEnv.js is working correctly.');
    res.status(500).json({ error: 'Calendly client ID is undefined. Server configuration error.' });
    return;
  }
  if (CALENDLY_CLIENT_ID === '') {
    console.error('[calendlyAuthRoutes] Configuration Error: CALENDLY_CLIENT_ID is an empty string. Please provide a valid Calendly Client ID in the .env file.');
    res.status(500).json({ error: 'Calendly client ID is configured but empty. Please provide a valid ID in .env.' });
    return;
  }
  // The original check, now as a fallback for other unexpected falsy values.
  if (!CALENDLY_CLIENT_ID) {
    console.error(`[calendlyAuthRoutes] Critical Error: CALENDLY_CLIENT_ID is falsy (but not undefined or empty string). Value: "${CALENDLY_CLIENT_ID}". This is an unexpected state.`);
    res.status(500).json({ error: 'Calendly client ID not configured or invalid. Please check server logs.' });
    return; 
  }
  const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${CALENDLY_REDIRECT_URI}`;
  res.redirect(authUrl);
  // Implicitly returns void here
});

// Handles the callback from Calendly after user authorization
// Path: /api/calendly/callback
calendlyAuthRouter.post('/callback', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { code } = req.body; // Assuming the frontend sends the code in the request body

  if (!code) {
    res.status(400).json({ error: 'Authorization code is missing' });
    return;
  }

  if (!CALENDLY_CLIENT_ID || !CALENDLY_CLIENT_SECRET) {
    res.status(500).json({ error: 'Calendly client credentials not configured' });
    return;
  }

  try {
    const tokenResponse = await axios.post('https://auth.calendly.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: CALENDLY_CLIENT_ID,
      client_secret: CALENDLY_CLIENT_SECRET,
      code: code,
      redirect_uri: CALENDLY_REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    res.json({
      message: 'Calendly authentication successful. Tokens obtained.',
      access_token,
      refresh_token,
      expires_in,
    });
  } catch (error: any) {
    console.error('Error exchanging Calendly authorization code:', error.response?.data || error.message);
    next(error);
  }
});

// Disconnects Calendly by revoking the access token
// Path: /api/calendly/disconnect
calendlyAuthRouter.post('/disconnect', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { access_token } = req.body;

  if (!access_token) {
    res.status(400).json({ error: 'Access token is missing for disconnect' });
    return;
  }

  if (!CALENDLY_CLIENT_ID || !CALENDLY_CLIENT_SECRET) {
    res.status(500).json({ error: 'Calendly client credentials not configured' });
    return;
  }

  try {
    await axios.post('https://auth.calendly.com/oauth/revoke', querystring.stringify({
      client_id: CALENDLY_CLIENT_ID,
      client_secret: CALENDLY_CLIENT_SECRET,
      token: access_token,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.json({ message: 'Calendly disconnected successfully. Please clear stored tokens.' });
  } catch (error: any) {
    console.error('Error revoking Calendly token:', error.response?.data || error.message);
    next(error);
  }
});

// Refreshes an expired Calendly access token using a refresh token
// Path: /api/calendly/refresh
calendlyAuthRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    res.status(400).json({ error: 'Refresh token is missing' });
    return;
  }

  if (!CALENDLY_CLIENT_ID || !CALENDLY_CLIENT_SECRET) {
    res.status(500).json({ error: 'Calendly client credentials not configured' });
    return;
  }

  try {
    const tokenResponse = await axios.post('https://auth.calendly.com/oauth/token', querystring.stringify({
      grant_type: 'refresh_token',
      client_id: CALENDLY_CLIENT_ID,
      client_secret: CALENDLY_CLIENT_SECRET,
      refresh_token: refresh_token,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token: new_refresh_token, expires_in } = tokenResponse.data;

    res.json({
      message: 'Calendly token refreshed successfully.',
      access_token,
      refresh_token: new_refresh_token,
      expires_in,
    });
  } catch (error: any) {
    console.error('Error refreshing Calendly token:', error.response?.data || error.message);
    next(error);
  }
});

export default calendlyAuthRouter; // Export the router instance
