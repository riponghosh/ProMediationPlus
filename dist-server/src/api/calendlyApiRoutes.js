import { Router } from 'express';
import axios from 'axios';
const calendlyApiRouter = Router();
// Middleware to log entry into this router
calendlyApiRouter.use((req, res, next) => {
    console.log(`[calendlyApiRouter] Request received for: ${req.method} ${req.originalUrl}`);
    next();
});
const CALENDLY_API_BASE_URL = 'https://api.calendly.com';
// Middleware to check for Calendly access token in headers
const requireCalendlyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7, authHeader.length);
        if (token) {
            req.calendlyAccessToken = token;
            next();
            return;
        }
    }
    res.status(401).json({ error: 'Unauthorized: Calendly access token is missing or invalid.' });
};
// Get current Calendly user information
calendlyApiRouter.get('/user', requireCalendlyToken, async (req, res, next) => {
    const accessToken = req.calendlyAccessToken;
    try {
        const response = await axios.get(`${CALENDLY_API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data.resource);
    }
    catch (error) {
        console.error('Error fetching Calendly user info:', error.response?.data || error.message);
        next(error);
    }
});
// Get Calendly event types for the current user
calendlyApiRouter.get('/event_types', requireCalendlyToken, async (req, res, next) => {
    const accessToken = req.calendlyAccessToken;
    let userUri = req.query.user_uri;
    try {
        if (!userUri) {
            const userResponse = await axios.get(`${CALENDLY_API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
            });
            userUri = userResponse.data.resource.uri;
        }
        if (!userUri) {
            res.status(400).json({ error: 'User URI is required to fetch event types and could not be determined.' });
            return;
        }
        const response = await axios.get(`${CALENDLY_API_BASE_URL}/event_types`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: {
                user: userUri,
                active: true,
            }
        });
        res.json(response.data.collection);
    }
    catch (error) {
        console.error('Error fetching Calendly event types:', error.response?.data || error.message);
        next(error);
    }
});
export default calendlyApiRouter;
//# sourceMappingURL=calendlyApiRoutes.js.map