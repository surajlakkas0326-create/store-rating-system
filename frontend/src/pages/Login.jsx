import React from 'react';
import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login(){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const[msg,setMsg]=useState('');const nav=useNavigate();
 async function submit(e){e.preventDefault();setMsg('');try{const r=await api.post('/auth/login',{email,password});localStorage.setItem('token',r.data.token);localStorage.setItem('user',JSON.stringify(r.data.user));nav(r.data.user.role==='admin'?'/admin':r.data.user.role==='owner'?'/owner':'/user');}catch(err){setMsg(err.response?.data?.message||'Login failed');}}
 return <div className="auth-page"><div className="auth-card"><h1>Store Rating</h1><p className="muted">Login to continue</p><form onSubmit={submit}><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="primary">Login</button>{msg&&<p className="error">{msg}</p>}</form><p className="center">New user? <Link to="/signup">Create an account</Link></p><div className="demo"><b>Demo login</b><br/>Admin: admin@example.com / Admin@123<br/>Owner: owner@example.com / Owner@123<br/>User: user@example.com / User@123</div></div></div>;
}
