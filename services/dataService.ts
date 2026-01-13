
import { DailyLog, Alert, Machine, AppState, SpareToolCategory, User } from '../types';

const STORAGE_KEY = 'sitecontrol_v2_data';

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const checkAlerts = (state: AppState): Alert[] => {
  const newAlerts: Alert[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // 1. Fuel Spike Alert (> 100% higher than yesterday)
  state.logs.forEach(log => {
    if (log.date === todayStr) {
      const yesterdayLog = state.logs.find(l => l.machineId === log.machineId && l.date === yesterdayStr);
      if (yesterdayLog && yesterdayLog.fuelUsed > 0 && log.fuelUsed > yesterdayLog.fuelUsed * 2) {
        newAlerts.push({
          id: `spike-${log.id}`,
          type: 'FUEL_SPIKE',
          severity: 'HIGH',
          message: `FUEL SPIKE ALERT: "${log.machineName}" used ${log.fuelUsed}L today vs ${yesterdayLog.fuelUsed}L yesterday (>100% increase).`,
          timestamp: Date.now(),
          machineId: log.machineId,
          logId: log.id
        });
      }
    }
  });

  // 2. Missing Daily Data Alert
  state.machines.forEach(machine => {
    const hasTodayLog = state.logs.some(l => l.machineId === machine.id && l.date === todayStr);
    if (!hasTodayLog) {
      newAlerts.push({
        id: `missing-${machine.id}-${todayStr}`,
        type: 'MISSING_DATA',
        severity: 'MEDIUM',
        message: `MISSING DATA ALERT: No operational entry for machine "${machine.name}" today.`,
        timestamp: Date.now(),
        machineId: machine.id
      });
    }
  });

  // 3. Missing Photo of Inventory (Daily Log Photos)
  state.logs.forEach(log => {
    if (log.date === todayStr && !log.photoUrl) {
      newAlerts.push({
        id: `photo-${log.id}`,
        type: 'MISSING_PHOTO',
        severity: 'MEDIUM',
        message: `MISSING PHOTO ALERT: Daily entry for "${log.machineName}" submitted without an inventory/site photo.`,
        timestamp: Date.now(),
        machineId: log.machineId,
        logId: log.id
      });
    }
  });

  // 4. Spare Tool Alert (Negative quantities)
  state.spareTools.forEach(cat => {
    cat.items.forEach(item => {
      if (item.quantity < 0) {
        newAlerts.push({
          id: `spare-${item.id}`,
          type: 'INVALID_SPARE_COUNT',
          severity: 'MEDIUM',
          message: `INVALID SPARE COUNT: "${item.name}" in category "${cat.name}" has dropped below zero (${item.quantity}).`,
          timestamp: Date.now(),
          supervisorId: cat.supervisorId
        });
      }
    });
  });

  return newAlerts;
};

export const generateExcelReport = (state: AppState) => {
  const { logs, spareTools, users } = state;
  
  // Sheet 1: Machine Data
  const machineData = logs.map(l => ({
    'Machine Name': l.machineName,
    'Date': l.date,
    'Fuel (L)': l.fuelUsed,
    'Hours Worked': l.hoursWorked,
    'Supervisor': l.supervisorName,
    'Notes': l.notes,
    'Has Photo': l.photoUrl ? 'Yes' : 'No'
  }));

  // Sheet 2: Spare Tools
  const spareData = spareTools.flatMap(cat => 
    cat.items.map(item => ({
      'Category': cat.name,
      'Item Name': item.name,
      'Quantity': item.quantity,
      'Managed By': users.find(u => u.id === cat.supervisorId)?.name || 'Unknown'
    }))
  );

  const wb = (window as any).XLSX.utils.book_new();
  const ws1 = (window as any).XLSX.utils.json_to_sheet(machineData);
  const ws2 = (window as any).XLSX.utils.json_to_sheet(spareData);
  
  (window as any).XLSX.utils.book_append_sheet(wb, ws1, "Daily Machine Logs");
  (window as any).XLSX.utils.book_append_sheet(wb, ws2, "Spare Tools Inventory");

  const fileName = `SiteControl_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  (window as any).XLSX.writeFile(wb, fileName);
  
  return fileName;
};

export const sendToWhatsApp = (ownerPhone: string, message: string) => {
  const encodedMsg = encodeURIComponent(message);
  const url = `https://wa.me/${ownerPhone.replace(/\D/g, '')}?text=${encodedMsg}`;
  window.open(url, '_blank');
};
