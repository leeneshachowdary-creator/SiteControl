
import { UserRole, User } from './types';

// The app starts with one default owner.
// Default PIN for owner is '8888'
export const INITIAL_USERS: User[] = [
  { 
    id: 'owner-1', 
    name: 'Admin Owner', 
    username: 'owner', 
    pin: '8888',
    role: UserRole.OWNER, 
    status: 'ACTIVE',
    phone: '+1234567890' 
  },
];
