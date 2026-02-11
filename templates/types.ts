
export enum Rank {
  CADET = 'Cadet',
  OFFICER_III = 'Officer III',
  OFFICER_II = 'Officer II',
  OFFICER_I = 'Officer I',
  SERGEANT = 'Sergeant',
  INSPECTOR = 'Inspector',
  CHIEF_INSPECTOR = 'Chief Inspector',
  COMMANDER = 'Commander'
}

export enum Section {
  OPERATIONS = 'Operations',
  INTELLIGENCE = 'Intelligence',
  LOGISTICS = 'Logistics',
  ADMINISTRATION = 'Administration',
  COMMUNICATIONS = 'Communications',
  TRAINING = 'Training'
}

export enum LeaveType {
  ANNUAL = 'Annual Leave',
  CASUAL = 'Casual Leave',
  SICK = 'Sick Leave',
  MATERNITY = 'Maternity Leave',
  PATERNITY = 'Paternity Leave',
  COMPASSIONATE = 'Compassionate Leave',
  STUDY = 'Study Leave'
}

export enum DutyType {
  GUARD = 'Main Gate Guard',
  PATROL = 'Perimeter Patrol',
  RADIO = 'Radio Room',
  DESK = 'Duty Desk',
  QRF = 'Quick Reaction Force'
}

export enum Shift {
  DAY = 'Day (0600-1800)',
  NIGHT = 'Night (1800-0600)'
}

export interface Personnel {
  id: string;
  serviceId: string;
  firstName: string;
  lastName: string;
  rank: Rank;
  section: Section;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Retired';
  joinedDate: string;
}

export interface LeaveRecord {
  id: string;
  personnelId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Completed' | 'Cancelled';
}

export interface DutyAssignment {
  id: string;
  personnelId: string;
  dutyType: DutyType;
  date: string;
  shift: Shift;
  assignedAt: string;
}

export interface TransferHistory {
  id: string;
  personnelId: string;
  fromSection: Section;
  toSection: Section;
  transferDate: string;
  reason: string;
}

export interface User {
  id: string;
  username: string;
  role: 'Administrator' | 'Viewer';
}
