
import React, { useState, useRef } from 'react';
// Fix: Changed Excavator to Machine to match types.ts
import { User, Machine, DailyLog, Alert } from '../types';
// Fix: Removed generateAlerts as it is not exported from dataService
import { checkAlerts } from '../services/dataService';
import { Camera, Plus, Save, Info, CheckCircle2 } from 'lucide-react';

interface SupervisorFormProps {
  currentUser: User;
  // Fix: Changed Excavator to Machine
  excavators: Machine[];
  allLogs: DailyLog[];
  // Fix: Adjusted signature to remove non-existent generateAlerts dependency
  onAddLog: (log: DailyLog) => void;
  // Fix: Changed Excavator to Machine
  onAddExcavator: (exc: Machine) => void;
}

const SupervisorForm: React.FC<SupervisorFormProps> = ({ currentUser, excavators, allLogs, onAddLog, onAddExcavator }) => {
  const [selectedExcavator, setSelectedExcavator] = useState('');
  const [fuel, setFuel] = useState('');
  const [hours, setHours] = useState(''); // Added hours state to match DailyLog requirements
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [isAddingExcavator, setIsAddingExcavator] = useState(false);
  const [newExcName, setNewExcName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExcavator) return alert('Please select an excavator');

    const machine = excavators.find(m => m.id === selectedExcavator);

    // Fix: Changed excavatorId to machineId and updated object to match DailyLog type interface
    const newLog: DailyLog = {
      id: Math.random().toString(36).substr(2, 9),
      machineId: selectedExcavator,
      machineName: machine?.name || 'Unknown',
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      fuelUsed: parseFloat(fuel) || 0,
      hoursWorked: parseFloat(hours) || 0,
      notes,
      supervisorId: currentUser.id,
      supervisorName: currentUser.name
    };

    onAddLog(newLog);

    // Reset form
    setFuel('');
    setHours('');
    setNotes('');
    setPhoto(null);
    setSelectedExcavator('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddExcavator = () => {
    if (!newExcName) return;
    // Fix: Updated to use Machine type properties
    const newExc: Machine = {
      id: 'mac-' + Math.random().toString(36).substr(2, 5),
      name: newExcName,
      supervisorId: currentUser.id,
      dateAdded: Date.now()
    };
    onAddExcavator(newExc);
    setNewExcName('');
    setIsAddingExcavator(false);
    setSelectedExcavator(newExc.id);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Daily Site Log</h1>
        <p className="text-slate-500">Record operation data for today: {new Date().toLocaleDateString()}</p>
      </header>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <span>Log submitted successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Machine Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Info size={18} className="text-construction-blue" />
              Machine Information
            </h2>
            <button 
              type="button"
              onClick={() => setIsAddingExcavator(!isAddingExcavator)}
              className="text-xs font-bold text-construction-blue hover:underline flex items-center gap-1"
            >
              <Plus size={14} />
              Add New Machine
            </button>
          </div>

          {isAddingExcavator ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Machine Name *</label>
                <input 
                  type="text" 
                  value={newExcName}
                  onChange={(e) => setNewExcName(e.target.value)}
                  placeholder="e.g. CAT-320X Excavator"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingExcavator(false)} className="px-3 py-1 text-slate-500">Cancel</button>
                <button type="button" onClick={handleAddExcavator} className="px-4 py-1 bg-construction-blue text-white rounded-md">Save Machine</button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Equipment</label>
              <select 
                value={selectedExcavator}
                onChange={(e) => setSelectedExcavator(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-construction-blue focus:outline-none bg-white"
                required
              >
                <option value="">-- Select Machine --</option>
                {excavators.map(exc => (
                  <option key={exc.id} value={exc.id}>{exc.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Resources Usage */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6">Daily Resource Consumption</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fuel Used (Liters)</label>
              <input 
                type="number" 
                step="0.1"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-construction-blue focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hours Worked</label>
              <input 
                type="number" 
                step="0.1"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-construction-blue focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Media & Notes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6">Site Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Site Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all ${photo ? 'border-construction-blue bg-blue-50' : 'border-slate-300 hover:border-construction-blue hover:bg-slate-50'}`}
              >
                {photo ? (
                  <img src={photo} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <>
                    <Camera size={40} className="text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-500">Tap to upload photo</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="text-xs text-slate-400">Required for official reports. Max 5MB.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Shift Notes</label>
              <textarea 
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe site progress, issues, or delays..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-construction-blue focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full md:w-auto px-12 py-4 bg-construction-blue hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Save size={20} />
            Submit Daily Log
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupervisorForm;
