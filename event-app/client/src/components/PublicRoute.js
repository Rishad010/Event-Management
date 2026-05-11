import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // You can add a loading spinner here if you want
    return <div>Loading...</div>;
  }

  if (user) {
    // If user is logged in, redirect them from public pages
    if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/dashboard" />;
  }

  // If user is not logged in, show the public page (Login, Register)
  return children;
};

export default PublicRoute; 