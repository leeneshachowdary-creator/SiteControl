
export enum UserRole {
  SUPERVISOR = 'SUPERVISOR',
  OWNER = 'OWNER'
}

export interface User {
  id: string;
  name: string;
  username: string;
  pin: string; // 4-digit PIN for login
  role: UserRole;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Machine {
  id: string;
  name: string;
  supervisorId: string;
  dateAdded: number;
}

export interface DailyLog {
  id: string;
  machineId: string;
  machineName: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  fuelUsed: number; // liters
  hoursWorked: number;
  notes: string;
  photoUrl?: string; // Optional site photo
  supervisorId: string;
  supervisorName: string;
}

export interface SpareToolItem {
  id: string;
  name: string;
  quantity: number;
  photoUrl?: string; // Optional inventory photo
}

export interface SpareToolCategory {
  id: string;
  name: string;
  items: SpareToolItem[];
  supervisorId: string;
}

export interface Alert {
  id: string;
  type: 'FUEL_SPIKE' | 'MISSING_DATA' | 'INVALID_SPARE_COUNT' | 'MISSING_PHOTO';
  severity: 'HIGH' | 'MEDIUM';
  message: string;
  timestamp: number;
  machineId?: string;
  supervisorId?: string;
  logId?: string;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  logs: DailyLog[];
  machines: Machine[];
  spareTools: SpareToolCategory[];
  alerts: Alert[];
}
