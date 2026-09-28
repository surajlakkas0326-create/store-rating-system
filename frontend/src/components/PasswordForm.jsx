import React from 'react';
import { useState } from 'react';
import api from '../api';

export default function PasswordForm() {
  const [password,setPassword]=useState(''); const [msg,setMsg]=useState('');
  async function update(e){e.preventDefault();setMsg('');try{const r=await api.put('/auth/password',{password});setMsg(r.data.message);setPassword('');}catch(err){setMsg(err.response?.data?.message||'Something went wrong');}}
  return <form onSubmit={update} className="small-form"><h3>Change Password</h3><input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} required/><button>Update Password</button>{msg&&<p className="message">{msg}</p>}</form>;
}
