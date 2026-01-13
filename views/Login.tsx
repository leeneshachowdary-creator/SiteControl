
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { HardHat, Construction, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user) {
      if (user.status === 'INACTIVE') {
        setError('Your account is deactivated. Contact Owner.');
        return;
      }
      
      if (user.pin === pin) {
        onLogin(user);
      } else {
        setError('Invalid PIN code');
      }
    } else {
      setError('Account not found');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden">
      {/* Decorative Construction Pattern */}
      <div className="absolute top-0 right-0 p-24 opacity-[0.03] rotate-12 pointer-events-none">
        <Construction size={400} />
      </div>

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-[#1e3a8a] p-10 text-center relative">
          <div className="bg-construction-yellow inline-flex p-5 rounded-3xl mb-6 shadow-2xl shadow-black/40 rotate-3">
            <HardHat size={48} className="text-slate-900" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">SiteControl</h1>
          <p className="text-blue-100/60 mt-2 font-medium">Logistics & Site Management</p>
          
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Auth Required</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 pt-14 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Username</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-construction-blue transition-colors" size={20} />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. owner)"
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Pin Code</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-construction-blue transition-colors" size={20} />
              <input 
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit PIN"
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold tracking-widest placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 rounded-2xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-black text-lg shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Sign In to System
          </button>
        </form>

        <div className="p-8 pt-0 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Licensed to Project Management Group
          </p>
        </div>
      </div>
      
      {/* Demo helper */}
      <div className="absolute bottom-8 right-8 text-white/40 text-xs font-bold flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/10">
        <p className="uppercase tracking-widest text-[10px] mb-1">Demo Access</p>
        <span>Owner: <code className="text-white">owner</code> PIN: <code className="text-white">8888</code></span>
      </div>
    </div>
  );
};

export default Login;
