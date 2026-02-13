
export enum Rank {
  DII = 'DII',
  DI = 'DI',
  CD = 'CD',
  ASO = 'ASO',
  SO = 'SO',
  SIOII = 'SIOII',
  SIOI = 'SIOI',
  SSIO = 'SSIO',
  PSIO = 'PSIO',
  CSIO = 'CSIO',
  ADIS = 'ADIS',
  DDIS = 'DDIS',
  DIS = 'DIS',
  ADG = 'ADG'
}

export interface SectionData {
  id: number;
  name: string;
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
  rank: string;
  section: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Retired';
  joinedDate: string;
}

export interface PersonnelFormData {
  serviceNumber: string;
  firstName: string;
  lastName: string;
  rank: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  stateOfOrigin: string;
  lgaOfOrigin: string;
  dateOfEnlistment: string;
  sectionId?: number;
  disposition?: string;
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
  fromSection: string;
  toSection: string;
  transferDate: string;
  reason: string;
}

export interface User {
  id: string;
  username: string;
  role: 'Administrator' | 'Viewer';
}

