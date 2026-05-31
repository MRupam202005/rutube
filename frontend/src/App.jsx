import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from './api/axios';
import { login, logout } from './store/authSlice';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthLayout from './components/AuthLayout';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt to silently refresh the session using our HttpOnly cookie
    api.get('/users/current-user')
      .then((res) => {
        if (res.data?.success) {
          dispatch(login({ userData: res.data.data }));
        } else {
          dispatch(logout());
        }
      })
      .catch((err) => {
        // If error (e.g. 401 Unauthorized), the cookie is expired or missing. Just log out.
        dispatch(logout());
      })
      .finally(() => {
        setIsLoading(false); // Stop loading regardless of success/fail
      });
  }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // While checking session, show a cinematic loader
  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        <Loader2 className="spinner" size={48} color="#2af5d1" />
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="main-content">
          <Sidebar isOpen={isSidebarOpen} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/auth" element={
                <AuthLayout authentication={false}>
                  <Auth />
                </AuthLayout>
              } />
              <Route path="/dashboard" element={
                <AuthLayout authentication={true}>
                  <Dashboard />
                </AuthLayout>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
