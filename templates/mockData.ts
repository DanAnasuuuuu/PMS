
import { Personnel, Rank, Section, LeaveRecord, LeaveType, DutyAssignment, DutyType, Shift } from './types';

export const mockPersonnel: Personnel[] = [
  { id: '1', serviceId: 'SO-001', firstName: 'John', lastName: 'Doe', rank: Rank.SERGEANT, section: Section.OPERATIONS, status: 'Active', joinedDate: '2020-01-15' },
  { id: '2', serviceId: 'SO-002', firstName: 'Jane', lastName: 'Smith', rank: Rank.OFFICER_I, section: Section.INTELLIGENCE, status: 'Active', joinedDate: '2021-03-22' },
  { id: '3', serviceId: 'SO-003', firstName: 'Robert', lastName: 'Brown', rank: Rank.OFFICER_II, section: Section.LOGISTICS, status: 'On Leave', joinedDate: '2019-11-10' },
  { id: '4', serviceId: 'SO-004', firstName: 'Alice', lastName: 'Wilson', rank: Rank.CADET, section: Section.OPERATIONS, status: 'Active', joinedDate: '2023-06-05' },
  { id: '5', serviceId: 'SO-005', firstName: 'Michael', lastName: 'Chen', rank: Rank.INSPECTOR, section: Section.ADMINISTRATION, status: 'Active', joinedDate: '2018-02-28' },
  { id: '6', serviceId: 'SO-006', firstName: 'Sarah', lastName: 'Taylor', rank: Rank.OFFICER_I, section: Section.TRAINING, status: 'Active', joinedDate: '2022-09-14' },
  { id: '7', serviceId: 'SO-007', firstName: 'Kevin', lastName: 'Davis', rank: Rank.OFFICER_III, section: Section.COMMUNICATIONS, status: 'Active', joinedDate: '2023-01-10' },
  { id: '8', serviceId: 'SO-008', firstName: 'Emma', lastName: 'White', rank: Rank.CHIEF_INSPECTOR, section: Section.OPERATIONS, status: 'Active', joinedDate: '2015-05-12' },
];

export const mockLeaves: LeaveRecord[] = [
  { id: 'l1', personnelId: '3', type: LeaveType.ANNUAL, startDate: '2024-05-15', endDate: '2024-05-30', status: 'Approved' },
  { id: 'l2', personnelId: '5', type: LeaveType.SICK, startDate: '2024-05-10', endDate: '2024-05-12', status: 'Completed' },
];

export const mockDuties: DutyAssignment[] = [
  { id: 'd1', personnelId: '1', dutyType: DutyType.GUARD, date: '2024-05-20', shift: Shift.DAY, assignedAt: '2024-05-19' },
  { id: 'd2', personnelId: '4', dutyType: DutyType.PATROL, date: '2024-05-20', shift: Shift.DAY, assignedAt: '2024-05-19' },
  { id: 'd3', personnelId: '2', dutyType: DutyType.RADIO, date: '2024-05-20', shift: Shift.NIGHT, assignedAt: '2024-05-19' },
];
