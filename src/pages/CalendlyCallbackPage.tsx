// src/pages/CalendlyCallbackPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { handleCalendlyCallback } from '../services/calendlyService';

const CalendlyCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Processing Calendly authorization...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      const authFailedError = `Calendly authorization failed: ${errorParam}`;
      setError(authFailedError);
      setMessage('');
      setTimeout(() => navigate('/settings', { state: { calendlyErrorMessage: authFailedError } }), 3000);
      return;
    }

    if (code) {
      handleCalendlyCallback(code)
        .then(response => {
          const successMsg = response.message || 'Successfully connected to Calendly!';
          setMessage(successMsg);
          // Navigate to the settings page, passing the success message in the state
          setTimeout(() => navigate('/settings', { state: { calendlySuccessMessage: successMsg } }), 2000);
        })
        .catch(err => {
          console.error("Backend callback error:", err);
          const errorMessage = err.error || 'Failed to finalize Calendly connection with backend.';
          setError(errorMessage);
          setMessage('');
          // Navigate to the settings page, passing the error message in the state
          setTimeout(() => navigate('/settings', { state: { calendlyErrorMessage: errorMessage } }), 3000);
        });
    } else if (!errorParam) { // Only set error if no code and no explicit errorParam
      const noCodeError = 'No authorization code found from Calendly.';
      setError(noCodeError);
      setMessage('');
      setTimeout(() => navigate('/settings', { state: { calendlyErrorMessage: noCodeError } }), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Calendly Authorization</h2>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p>You will be redirected shortly...</p>
    </div>
  );
};

export default CalendlyCallbackPage;