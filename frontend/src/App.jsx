import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

function PrivateRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
    <Route path="/user" element={<PrivateRoute roles={['normal']}><UserDashboard /></PrivateRoute>} />
    <Route path="/owner" element={<PrivateRoute roles={['owner']}><OwnerDashboard /></PrivateRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
