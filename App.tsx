
import React, { useState, useEffect, useMemo } from 'react';
import { User, AppState, UserRole, DailyLog, Machine, SpareToolCategory, Alert } from './types';
import { INITIAL_USERS } from './constants';
import { loadState, saveState, checkAlerts } from './services/dataService';
import Login from './views/Login';
import OwnerDashboard from './views/OwnerDashboard';
import SupervisorDashboard from './views/SupervisorDashboard';
import { LogOut, HardHat, ShieldCheck, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadState();
    return saved || {
      users: INITIAL_USERS,
      currentUser: null,
      logs: [],
      machines: [],
      spareTools: [],
      alerts: []
    };
  });

  // Sync state to local storage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Periodic alert check (simulation of "end of day" or real-time)
  useEffect(() => {
    if (state.currentUser) {
      const currentAlerts = checkAlerts(state);
      // Only update if alerts actually changed (shallow check for demo)
      if (JSON.stringify(currentAlerts) !== JSON.stringify(state.alerts)) {
        setState(prev => ({ ...prev, alerts: currentAlerts }));
      }
    }
  }, [state.logs, state.machines, state.spareTools, state.currentUser]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const updateUserStatus = (userId: string, status: 'ACTIVE' | 'INACTIVE') => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, status } : u)
    }));
  };

  const deleteUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
  };

  const createSupervisor = (name: string, username: string, pin: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      username,
      pin,
      role: UserRole.SUPERVISOR,
      status: 'ACTIVE'
    };
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };

  if (!state.currentUser) {
    return <Login users={state.users} onLogin={handleLogin} />;
  }

  const { currentUser } = state;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-construction-blue text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="bg-construction-yellow p-3 rounded-2xl shadow-lg shadow-black/30">
            <HardHat className="text-slate-900 w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter block leading-none">SiteControl</span>
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-1">Management Portal</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
          <div className="px-4">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Account</p>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <p className="text-xs text-blue-200">User Session</p>
              <p className="font-bold text-lg truncate">{currentUser.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${currentUser.role === UserRole.OWNER ? 'bg-construction-yellow' : 'bg-green-400'}`}></span>
                <span className="text-[10px] text-white/70 font-bold uppercase">{currentUser.role}</span>
              </div>
            </div>
          </div>

          <nav className="space-y-2 px-2">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Navigation</p>
            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/10 text-white font-semibold transition-all">
              {currentUser.role === UserRole.OWNER ? <ShieldCheck size={20} /> : <Briefcase size={20} />}
              {currentUser.role === UserRole.OWNER ? 'Master Control' : 'Field Operations'}
            </button>
          </nav>
        </div>

        <div className="p-6 mt-auto border-t border-white/5 bg-slate-900/40">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all border border-red-500/20"
          >
            <LogOut size={20} />
            Secure Logout
          </button>
          <p className="text-center text-[10px] text-blue-500 mt-6 font-medium">© 2024 SITECONTROL v2.0</p>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto">
        {currentUser.role === UserRole.OWNER ? (
          <OwnerDashboard 
            state={state} 
            onUpdateUser={updateUserStatus}
            onDeleteUser={deleteUser}
            onCreateSupervisor={createSupervisor}
          />
        ) : (
          <SupervisorDashboard 
            state={state}
            setState={setState}
          />
        )}
      </main>
    </div>
  );
};

export default App;
