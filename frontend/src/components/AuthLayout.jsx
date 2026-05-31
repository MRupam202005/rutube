import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const authStatus = useSelector(state => state.auth.status);

  useEffect(() => {
    // If route requires authentication and user is NOT logged in -> redirect to login
    if (authentication && authStatus !== authentication) {
      navigate('/auth');
    } 
    // If route does NOT require authentication (like login page) and user IS logged in -> redirect to home/dashboard
    else if (!authentication && authStatus !== authentication) {
      navigate('/dashboard');
    }
    setLoader(false);
  }, [authStatus, navigate, authentication]);

  return loader ? (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="spinner" size={48} color="#2af5d1" />
    </div>
  ) : <>{children}</>;
}
