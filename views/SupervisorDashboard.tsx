
import React, { useState, useRef } from 'react';
import { AppState, DailyLog, Machine, SpareToolCategory, SpareToolItem } from '../types';
import { Truck, Plus, History, Hammer, Save, ListPlus, ChevronRight, Gauge, Clock, Trash2, Camera, X } from 'lucide-react';

interface SupervisorDashboardProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ state, setState }) => {
  const [activeView, setActiveView] = useState<'fleet' | 'logs' | 'tools'>('fleet');
  
  // Log form state
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [fuel, setFuel] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logPhoto, setLogPhoto] = useState<string | null>(null);

  // Machine form state
  const [newMachineName, setNewMachineName] = useState('');

  // Spare tool state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = state.currentUser!;
  const myMachines = state.machines.filter(m => m.supervisorId === currentUser.id);
  const myLogs = state.logs.filter(l => l.supervisorId === currentUser.id);
  const myTools = state.spareTools.filter(t => t.supervisorId === currentUser.id);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName) return;
    const newMachine: Machine = {
      id: 'mac-' + Math.random().toString(36).substr(2, 5),
      name: newMachineName,
      supervisorId: currentUser.id,
      dateAdded: Date.now()
    };
    setState(prev => ({ ...prev, machines: [...prev.machines, newMachine] }));
    setNewMachineName('');
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = myMachines.find(m => m.id === selectedMachineId);
    if (!machine || !fuel || !hours) return;

    const newLog: DailyLog = {
      id: Math.random().toString(36).substr(2, 9),
      machineId: selectedMachineId,
      machineName: machine.name,
      timestamp: Date.now(),
      date: logDate,
      fuelUsed: parseFloat(fuel),
      hoursWorked: parseFloat(hours),
      notes,
      photoUrl: logPhoto || undefined,
      supervisorId: currentUser.id,
      supervisorName: currentUser.name
    };

    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs] }));
    setSelectedMachineId('');
    setFuel('');
    setHours('');
    setNotes('');
    setLogPhoto(null);
    alert('Log entry saved successfully!');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const newCat: SpareToolCategory = {
      id: 'cat-' + Math.random().toString(36).substr(2, 5),
      name: newCategoryName,
      items: [],
      supervisorId: currentUser.id
    };
    setState(prev => ({ ...prev, spareTools: [...prev.spareTools, newCat] }));
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const addItemToCategory = (catId: string, name: string, qty: number, photoUrl?: string) => {
    const newItem: SpareToolItem = {
      id: 'item-' + Math.random().toString(36).substr(2, 5),
      name,
      quantity: qty,
      photoUrl
    };
    setState(prev => ({
      ...prev,
      spareTools: prev.spareTools.map(cat => 
        cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat
      )
    }));
  };

  const updateItemQty = (catId: string, itemId: string, change: number) => {
    setState(prev => ({
      ...prev,
      spareTools: prev.spareTools.map(cat => 
        cat.id === catId ? {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, quantity: item.quantity + change } : item
          )
        } : cat
      )
    }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Field Operations</h2>
        <p className="text-slate-500 font-medium">Local site data entry and equipment tracking</p>
      </header>

      {/* Local Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NavCard active={activeView === 'fleet'} onClick={() => setActiveView('fleet')} icon={<Truck />} label="Fleet Registry" subtitle={`${myMachines.length} Active Machines`} />
        <NavCard active={activeView === 'logs'} onClick={() => setActiveView('logs')} icon={<Gauge />} label="Operations Log" subtitle="Log daily fuel & hours" />
        <NavCard active={activeView === 'tools'} onClick={() => setActiveView('tools')} icon={<Hammer />} label="Spare Tools" subtitle={`${myTools.length} Inventory Categories`} />
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        {activeView === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl sticky top-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                   <Plus className="text-construction-blue" />
                   Register Machine
                </h3>
                <form onSubmit={handleAddMachine} className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Machine Identity</label>
                      <input 
                        value={newMachineName}
                        onChange={e => setNewMachineName(e.target.value)}
                        placeholder="e.g. CAT 320 Excavator"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-medium"
                        required
                      />
                   </div>
                   <button type="submit" className="w-full bg-construction-blue text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                      Deploy Machine
                   </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <h3 className="font-black text-slate-800 tracking-tight text-xl">Assigned Fleet</h3>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{myMachines.length} Items</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                     {myMachines.map(m => (
                       <div key={m.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-2xl bg-construction-yellow/10 flex items-center justify-center text-construction-yellow shadow-inner">
                                <Truck size={28} />
                             </div>
                             <div>
                                <p className="text-xl font-black text-slate-900">{m.name}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Commissioned {new Date(m.dateAdded).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <button onClick={() => setState(prev => ({...prev, machines: prev.machines.filter(mx => mx.id !== m.id)}))} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                             <Trash2 size={20} />
                          </button>
                       </div>
                     ))}
                     {myMachines.length === 0 && (
                       <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Fleet Empty</div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeView === 'logs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                   <Gauge className="text-blue-500" />
                   New Daily Entry
                </h3>
                <form onSubmit={handleAddLog} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Target Machine</label>
                        <select 
                          value={selectedMachineId} 
                          onChange={e => setSelectedMachineId(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold"
                          required
                        >
                           <option value="">Select Equipment</option>
                           {myMachines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Fuel Consumed (L)</label>
                         <input type="number" step="0.1" value={fuel} onChange={e => setFuel(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold" placeholder="0.0" required />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Hours Worked</label>
                         <input type="number" step="0.1" value={hours} onChange={e => setHours(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold" placeholder="0.0" required />
                      </div>
                      <div className="col-span-2">
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Date of Operation</label>
                         <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold" required />
                      </div>
                      <div className="col-span-2">
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Inventory/Site Photo</label>
                         <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${logPhoto ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'}`}
                         >
                            {logPhoto ? (
                              <div className="relative w-full h-full">
                                <img src={logPhoto} className="w-full h-full object-cover rounded-2xl" />
                                <button onClick={(e) => {e.stopPropagation(); setLogPhoto(null);}} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"><X size={16}/></button>
                              </div>
                            ) : (
                              <>
                                <Camera className="text-slate-400 mb-2" size={32} />
                                <p className="text-xs font-bold text-slate-400">Upload Inventory Photo (Required for Alert Prevention)</p>
                              </>
                            )}
                         </div>
                         <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handlePhotoUpload(e, setLogPhoto)} />
                      </div>
                      <div className="col-span-2">
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Optional Remarks</label>
                         <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-medium h-32" placeholder="Site delays, maintenance issues, etc." />
                      </div>
                   </div>
                   <button type="submit" className="w-full py-5 bg-[#1e3a8a] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                      <Save size={24} /> Commit Entry
                   </button>
                </form>
             </div>
             
             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-black text-slate-800 text-xl tracking-tight">Recent Activity Log</h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[700px]">
                   {myLogs.map(l => (
                     <div key={l.id} className="p-8 hover:bg-slate-50 transition-all flex justify-between items-center group">
                        <div className="space-y-1">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{l.date}</span>
                              <h5 className="font-black text-slate-900">{l.machineName}</h5>
                           </div>
                           <p className="text-sm text-slate-500 line-clamp-1 italic">"{l.notes || 'No notes'}"</p>
                        </div>
                        <div className="flex items-center gap-4">
                           {l.photoUrl && (
                             <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                                <img src={l.photoUrl} className="w-full h-full object-cover" />
                             </div>
                           )}
                           <div className="text-right">
                              <p className="text-lg font-black text-slate-800 leading-none">{l.fuelUsed}L</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.hoursWorked}h work</p>
                           </div>
                           <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                     </div>
                   ))}
                   {myLogs.length === 0 && (
                     <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">History is Clear</div>
                   )}
                </div>
             </div>
          </div>
        )}

        {activeView === 'tools' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg">
               <div>
                  <h3 className="text-xl font-black text-slate-900">Tool Management</h3>
                  <p className="text-sm text-slate-500 font-medium">Create categories and track unit counts</p>
               </div>
               <button 
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="flex items-center gap-3 px-6 py-4 bg-construction-blue text-white rounded-2xl font-black shadow-xl"
               >
                  <ListPlus size={20} /> Add Category
               </button>
            </div>

            {showAddCategory && (
              <form onSubmit={handleAddCategory} className="bg-blue-50 p-10 rounded-[2.5rem] border border-blue-100 animate-in slide-in-from-top-4 duration-300">
                <div className="flex gap-4">
                  <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-1 px-6 py-4 rounded-2xl border-2 border-blue-200 bg-white font-bold" placeholder="Enter Category Name (e.g. Electric Drills)" required />
                  <button type="submit" className="bg-construction-blue text-white px-10 rounded-2xl font-black">Register</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {myTools.map(cat => (
                 <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                       <h4 className="text-2xl font-black text-slate-900 tracking-tight">{cat.name}</h4>
                       <button onClick={() => setState(prev => ({...prev, spareTools: prev.spareTools.filter(cx => cx.id !== cat.id)}))} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={20} />
                       </button>
                    </div>

                    <div className="space-y-4">
                       {cat.items.map(item => (
                         <div key={item.id} className="flex flex-col gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {item.photoUrl && (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={item.photoUrl} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <span className="font-bold text-slate-700">{item.name}</span>
                              </div>
                              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <button onClick={() => updateItemQty(cat.id, item.id, -1)} className="px-4 py-2 hover:bg-red-50 text-red-500 font-black transition-colors">-</button>
                                <span className="w-12 text-center font-black border-x border-slate-100">{item.quantity}</span>
                                <button onClick={() => updateItemQty(cat.id, item.id, 1)} className="px-4 py-2 hover:bg-green-50 text-green-600 font-black transition-colors">+</button>
                              </div>
                            </div>
                         </div>
                       ))}
                       <ToolItemForm onAdd={(name, qty, photo) => addItemToCategory(cat.id, name, qty, photo)} />
                    </div>
                 </div>
               ))}
               {myTools.length === 0 && (
                 <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-widest text-2xl border-4 border-dashed border-slate-200 rounded-[3rem]">
                    Inventory Not Defined
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolItemForm: React.FC<{onAdd: (name: string, qty: number, photo?: string) => void}> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && qty) {
      onAdd(name, parseInt(qty), photo || undefined);
      setName('');
      setQty('');
      setPhoto(null);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100 space-y-3">
      <form onSubmit={submit} className="flex gap-2">
         <input value={name} onChange={e => setName(e.target.value)} className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold" placeholder="Item Name" required />
         <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-16 px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold" placeholder="Qty" required />
         <button type="button" onClick={() => fileRef.current?.click()} className={`p-2 rounded-xl transition-all ${photo ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}><Camera size={16}/></button>
         <button type="submit" className="p-2 bg-construction-blue text-white rounded-xl shadow-lg"><Plus size={16}/></button>
         <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleFile} />
      </form>
      {photo && <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Photo attached</p>}
    </div>
  );
}

const NavCard: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string, subtitle: string}> = ({ active, onClick, icon, label, subtitle }) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-[2rem] text-left border transition-all relative overflow-hidden group shadow-lg ${active ? 'bg-construction-blue border-transparent text-white ring-8 ring-blue-500/10' : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:shadow-xl'}`}
  >
    <div className={`mb-6 p-4 rounded-2xl w-fit transition-all group-hover:rotate-12 ${active ? 'bg-construction-yellow text-slate-900 shadow-lg shadow-black/20' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
       {React.cloneElement(icon as React.ReactElement, { size: 28 })}
    </div>
    <h4 className="text-xl font-black tracking-tight">{label}</h4>
    <p className={`text-xs font-bold mt-1 uppercase tracking-widest ${active ? 'text-blue-300' : 'text-slate-400'}`}>{subtitle}</p>
    
    <div className={`absolute top-6 right-6 transition-all ${active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
       <ChevronRight size={24} />
    </div>
  </button>
);

export default SupervisorDashboard;
