
import React, { useState } from 'react';
import { AppState, UserRole, User, Alert } from '../types';
import { generateExcelReport, sendToWhatsApp } from '../services/dataService';
import { 
  Users, Truck, Settings, FileSpreadsheet, Send, AlertTriangle, 
  Trash2, UserPlus, ToggleLeft, ToggleRight, Hammer, Fuel, Clock, Eye, EyeOff, ExternalLink
} from 'lucide-react';

interface OwnerDashboardProps {
  state: AppState;
  onUpdateUser: (id: string, status: 'ACTIVE' | 'INACTIVE') => void;
  onDeleteUser: (id: string) => void;
  onCreateSupervisor: (name: string, username: string, pin: string) => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ state, onUpdateUser, onDeleteUser, onCreateSupervisor }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'machines' | 'tools' | 'alerts'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUserPin, setNewUserPin] = useState('');
  const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({});

  const supervisors = state.users.filter(u => u.role === UserRole.SUPERVISOR);
  
  const handleAddSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName && newUsername && newUserPin) {
      if (newUserPin.length !== 4) {
        alert('PIN must be exactly 4 digits');
        return;
      }
      onCreateSupervisor(newUserName, newUsername, newUserPin);
      setNewUserName('');
      setNewUsername('');
      setNewUserPin('');
      setShowAddUser(false);
    }
  };

  const togglePinVisibility = (id: string) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReportAction = () => {
    const fileName = generateExcelReport(state);
    const owner = state.users.find(u => u.role === UserRole.OWNER);
    if (owner?.phone) {
      const alertSummary = state.alerts.length > 0 ? `\n\nURGENT: There are ${state.alerts.length} active alerts requiring attention.` : '';
      const msg = `SITECONTROL REPORT: Daily Site Report for ${new Date().toLocaleDateString()} is ready.${alertSummary}`;
      sendToWhatsApp(owner.phone, msg);
    }
    alert(`Report "${fileName}" generated and downloaded!`);
  };

  // Fix: Renamed parameter 'alert' to 'alertItem' to avoid shadowing the global browser 'alert' function.
  // This resolves the error where 'alert' was treated as the 'Alert' type object instead of the callable function.
  const notifyAlert = (alertItem: Alert) => {
    const owner = state.users.find(u => u.role === UserRole.OWNER);
    if (owner?.phone) {
      const msg = `SITECONTROL ALERT: ${alertItem.message} (Triggered: ${new Date(alertItem.timestamp).toLocaleTimeString()})`;
      sendToWhatsApp(owner.phone, msg);
    } else {
      alert('Owner phone number not found for notification.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Owner Command Center</h2>
          <p className="text-slate-500 font-medium">Global site visibility and resource management</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReportAction}
            className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-xl shadow-green-900/20 transition-all active:scale-95"
          >
            <FileSpreadsheet size={24} />
            Generate & Send Report
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-3xl border border-slate-200 shadow-sm max-w-2xl">
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18}/>} label="Supervisors" />
        <TabButton active={activeTab === 'machines'} onClick={() => setActiveTab('machines')} icon={<Truck size={18}/>} label="Equipment" />
        <TabButton active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Hammer size={18}/>} label="Spare Tools" />
        <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<AlertTriangle size={18}/>} label="Alerts" count={state.alerts.length} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Supervisor Directory</h3>
                <p className="text-sm text-slate-500 font-medium">Manage field staff access and status</p>
              </div>
              <button 
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-6 py-3 bg-construction-blue text-white rounded-2xl font-bold shadow-lg"
              >
                <UserPlus size={18} /> Add New
              </button>
            </div>

            {showAddUser && (
              <form onSubmit={handleAddSupervisor} className="p-8 bg-blue-50 border-b border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                    <input value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full px-5 py-3 rounded-xl border border-blue-200 bg-white" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                    <input value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full px-5 py-3 rounded-xl border border-blue-200 bg-white" placeholder="john.site" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Login PIN (4 digits)</label>
                    <input 
                      type="text" 
                      maxLength={4} 
                      value={newUserPin} 
                      onChange={e => setNewUserPin(e.target.value.replace(/\D/g, ''))} 
                      className="w-full px-5 py-3 rounded-xl border border-blue-200 bg-white font-bold tracking-widest" 
                      placeholder="1234" 
                      required 
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-construction-blue text-white py-3 rounded-xl font-bold">Create Account</button>
                    <button type="button" onClick={() => setShowAddUser(false)} className="px-5 py-3 rounded-xl bg-slate-200 text-slate-600 font-bold">Cancel</button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4 text-left">Supervisor</th>
                    <th className="px-8 py-4 text-left">Username</th>
                    <th className="px-8 py-4 text-left">Access PIN</th>
                    <th className="px-8 py-4 text-left">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supervisors.map(u => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all font-black">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800 text-lg">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.username}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className="font-bold font-mono tracking-widest text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                              {showPins[u.id] ? u.pin : '••••'}
                           </span>
                           <button 
                            onClick={() => togglePinVisibility(u.id)}
                            className="text-slate-400 hover:text-blue-600 p-1"
                           >
                              {showPins[u.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                           </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => onUpdateUser(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            {u.status === 'ACTIVE' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button onClick={() => onDeleteUser(u.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {supervisors.length === 0 && (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">No Supervisors Registered</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'machines' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.machines.map(m => {
              const supervisor = state.users.find(u => u.id === m.supervisorId);
              const machineLogs = state.logs.filter(l => l.machineId === m.id);
              const totalFuel = machineLogs.reduce((sum, l) => sum + l.fuelUsed, 0);
              const totalHours = machineLogs.reduce((sum, l) => sum + l.hoursWorked, 0);
              const lastLog = machineLogs[0];
              
              return (
                <div key={m.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl space-y-6 group hover:-translate-y-1 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="bg-construction-yellow p-4 rounded-3xl shadow-lg">
                      <Truck className="text-slate-900" size={32} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added by</span>
                      <p className="text-xs font-bold text-slate-700">{supervisor?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{m.name}</h4>
                    {lastLog?.photoUrl && (
                      <div className="mt-4 w-full h-32 rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
                         <img src={lastLog.photoUrl} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Fuel size={12} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Fuel Sum</span>
                      </div>
                      <p className="text-lg font-black text-slate-800">{totalFuel.toFixed(1)}L</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={12} className="text-orange-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Hours Sum</span>
                      </div>
                      <p className="text-lg font-black text-slate-800">{totalHours.toFixed(1)}h</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {state.machines.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                No Machines registered in fleet
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
           <div className="space-y-6">
              {state.spareTools.map(cat => (
                <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-slate-100 rounded-2xl">
                         <Hammer className="text-slate-600" size={24} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{cat.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                           Managed By {state.users.find(u => u.id === cat.supervisorId)?.name}
                        </p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {cat.items.map(item => (
                        <div key={item.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl text-center flex flex-col items-center">
                           {item.photoUrl && (
                             <div className="w-12 h-12 rounded-xl mb-3 overflow-hidden border border-slate-200 shadow-sm">
                                <img src={item.photoUrl} className="w-full h-full object-cover" />
                             </div>
                           )}
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.name}</p>
                           <p className={`text-2xl font-black ${item.quantity < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                              {item.quantity}
                           </p>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
              {state.spareTools.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">No Tool Categories Defined</div>
              )}
           </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {state.alerts.map(alert => (
              <div key={alert.id} className={`p-8 rounded-[2rem] border shadow-xl flex items-start gap-6 transition-all hover:scale-[1.01] ${alert.severity === 'HIGH' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className={`p-4 rounded-2xl shadow-lg ${alert.severity === 'HIGH' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                   <AlertTriangle size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${alert.severity === 'HIGH' ? 'text-red-600' : 'text-orange-600'}`}>
                       Priority {alert.severity} • {alert.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  <h4 className={`text-xl font-black tracking-tight ${alert.severity === 'HIGH' ? 'text-red-900' : 'text-orange-900'}`}>
                    {alert.message}
                  </h4>
                  {alert.logId && state.logs.find(l => l.id === alert.logId)?.photoUrl && (
                    <div className="mt-4 w-48 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg">
                       <img src={state.logs.find(l => l.id === alert.logId)!.photoUrl} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={() => notifyAlert(alert)}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                      <Send size={14} /> Send to Phone
                    </button>
                    <button className="px-6 py-3 bg-white/50 border border-current/10 rounded-2xl text-xs font-black hover:bg-white transition-all uppercase tracking-widest">
                       Ignore
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {state.alerts.length === 0 && (
              <div className="py-20 text-center text-green-500/30 font-black uppercase tracking-widest text-2xl">All Systems Operating Normally</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number}> = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all ${active ? 'bg-construction-blue text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
  >
    {icon}
    {label}
    {count !== undefined && count > 0 && (
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? 'bg-construction-yellow text-slate-900' : 'bg-red-500 text-white'}`}>
        {count}
      </span>
    )}
  </button>
);

export default OwnerDashboard;
