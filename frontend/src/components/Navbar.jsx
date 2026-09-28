import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ title }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  function logout() { localStorage.clear(); navigate('/'); }
  return <header className="topbar">
    <div><h2>{title}</h2><small>{user?.name}</small></div>
    <button className="outline-btn" onClick={logout}>Logout</button>
  </header>;
}
