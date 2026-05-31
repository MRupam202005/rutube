import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import './Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.post('/users/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify email. Token may be invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
        {status === 'verifying' && (
          <>
            <Loader2 className="spinner" size={48} color="#2af5d1" style={{ margin: '0 auto 20px' }} />
            <h2 className="auth-title">Verifying Email</h2>
            <p className="auth-subtitle">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} color="#2af5d1" style={{ margin: '0 auto 20px' }} />
            <h2 className="auth-title">Verified!</h2>
            <p className="auth-subtitle">{message}</p>
            <button 
              className="btn-primary" 
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => navigate('/auth')}
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} color="#ff4b4b" style={{ margin: '0 auto 20px' }} />
            <h2 className="auth-title">Verification Failed</h2>
            <p className="auth-subtitle">{message}</p>
            <button 
              className="btn-secondary" 
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => navigate('/auth')}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
