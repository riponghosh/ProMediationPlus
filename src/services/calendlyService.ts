// src/services/calendlyService.ts
import axios from 'axios';
import { CalendlyUserResource, CalendlyEventTypeResource, CalendlyCollectionResponse } from '../types/calendlyTypes';

// IMPORTANT: Configure this to point to your backend
// You can use an environment variable for this in a real app
// e.g., process.env.REACT_APP_BACKEND_URL or similar
const BACKEND_API_URL = 'http://localhost:3001/api'; // Your backend API prefix

const CALENDLY_ACCESS_TOKEN_KEY = 'calendly_access_token';
const CALENDLY_REFRESH_TOKEN_KEY = 'calendly_refresh_token';

interface CalendlyAuthResponse extends CalendlyConnectResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

interface CalendlyConnectResponse {
  message: string;
}

interface CalendlyError {
  error: string;
}

// This function simply redirects the user. The actual auth happens via backend.
export const initiateCalendlyAuth = (): void => {
  // The backend auth route is /api/calendly as configured in server.ts
  window.location.href = `${BACKEND_API_URL}/calendly`;
};

export const handleCalendlyCallback = async (code: string): Promise<CalendlyAuthResponse> => {
  try {
    // The backend callback route is /api/calendly/callback
    const response = await axios.post<CalendlyAuthResponse>(`${BACKEND_API_URL}/calendly/callback`, { code });
    if (response.data.access_token) {
      localStorage.setItem(CALENDLY_ACCESS_TOKEN_KEY, response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem(CALENDLY_REFRESH_TOKEN_KEY, response.data.refresh_token);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as CalendlyError;
    }
    throw { error: 'An unknown error occurred during Calendly callback.' };
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem(CALENDLY_ACCESS_TOKEN_KEY);
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const getCalendlyUserInfo = async (): Promise<CalendlyUserResource> => { // Return type changed to just CalendlyUserResource
  try {
    // Backend route is /api/calendly-api/user
    const response = await axios.get<CalendlyUserResource>(`${BACKEND_API_URL}/calendly-api/user`, {
      headers: getAuthHeaders(),
    });
    return response.data; // The backend now directly returns the resource object
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as CalendlyError;
    }
    throw { error: 'Failed to fetch Calendly user info.' };
  }
};

export const getCalendlyEventTypes = async (userUri?: string): Promise<CalendlyCollectionResponse<CalendlyEventTypeResource>> => {
  try {
    // Backend route is /api/calendly-api/event_types
    const response = await axios.get<CalendlyCollectionResponse<CalendlyEventTypeResource>>(
      `${BACKEND_API_URL}/calendly-api/event_types`,
      {
        headers: getAuthHeaders(),
        // Backend will fetch userUri if not provided, or use if provided
        params: userUri ? { user_uri: userUri } : {},
      }
    );
    return response.data; // The backend now directly returns the collection
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as CalendlyError;
    }
    throw { error: 'Failed to fetch Calendly event types.' };
  }
};

export const disconnectCalendly = async (): Promise<CalendlyConnectResponse> => {
  const accessToken = localStorage.getItem(CALENDLY_ACCESS_TOKEN_KEY);
  try {
    // Backend route is /api/calendly/disconnect
    const response = await axios.post<CalendlyConnectResponse>(`${BACKEND_API_URL}/calendly/disconnect`, 
      { access_token: accessToken }, // Send access_token in the body
      {
        headers: getAuthHeaders(), // Good practice to also send as Bearer if API expects it, though revoke might not need it if token is in body
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as CalendlyError;
    }
    throw { error: 'An unknown error occurred during Calendly disconnection.' };
  } finally {
    // Always clear tokens from localStorage after attempting disconnect
    localStorage.removeItem(CALENDLY_ACCESS_TOKEN_KEY);
    localStorage.removeItem(CALENDLY_REFRESH_TOKEN_KEY);
  }
};

export const getStoredCalendlyAccessToken = (): string | null => {
  return localStorage.getItem(CALENDLY_ACCESS_TOKEN_KEY);
};

export const refreshCalendlyToken = async (): Promise<CalendlyAuthResponse | null> => {
  const refreshToken = localStorage.getItem(CALENDLY_REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    console.log('No refresh token available for Calendly.');
    return null;
  }

  try {
    const response = await axios.post<CalendlyAuthResponse>(`${BACKEND_API_URL}/calendly/refresh`, { 
      refresh_token: refreshToken 
    });

    if (response.data.access_token) {
      localStorage.setItem(CALENDLY_ACCESS_TOKEN_KEY, response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem(CALENDLY_REFRESH_TOKEN_KEY, response.data.refresh_token);
    }
    return response.data;
  } catch (error) {
    console.error('Failed to refresh Calendly token:', error);
    localStorage.removeItem(CALENDLY_ACCESS_TOKEN_KEY);
    localStorage.removeItem(CALENDLY_REFRESH_TOKEN_KEY);
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as CalendlyError;
    }
    throw { error: 'Failed to refresh Calendly token. Please re-authenticate.' };
  }
};