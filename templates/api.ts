import axios from 'axios';
import { Personnel, LeaveRecord, DutyAssignment, PersonnelFormData, SectionData, LeaveFormData } from './types';

// In Docker, 'localhost' refers to the container itself. 
// When browser accesses it, it refers to the user's machine.
// We exposed Django on 8000, so localhost:8000 should work from the browser.
const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getPersonnel = async (searchQuery?: string): Promise<Personnel[]> => {
    try {
        const params = searchQuery ? { search: searchQuery } : {};
        const response = await api.get('/personnel/', { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch personnel:", error);
        return [];
    }
};

export const createPersonnel = async (data: PersonnelFormData): Promise<Personnel> => {
    try {
        const response = await api.post('/personnel/', data);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create personnel:", error);
        // Extract error message from response
        if (error.response?.data) {
            const errorMessages = Object.entries(error.response.data)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('\n');
            throw new Error(errorMessages);
        }
        throw new Error('Failed to create personnel. Please try again.');
    }
};

export const getSections = async (): Promise<SectionData[]> => {
    try {
        const response = await api.get('/sections/');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch sections:", error);
        return [];
    }
};

// Leave Management API
export const getLeaves = async (filters?: { status?: string; personnel?: string }): Promise<LeaveRecord[]> => {
    try {
        const params = filters || {};
        const response = await api.get('/leaves/', { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch leaves:", error);
        return [];
    }
};

export const createLeave = async (data: LeaveFormData): Promise<LeaveRecord> => {
    try {
        const response = await api.post('/leaves/', data);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create leave:", error);
        if (error.response?.data) {
            const errorMessages = Object.entries(error.response.data)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('\n');
            throw new Error(errorMessages);
        }
        throw new Error('Failed to create leave request. Please try again.');
    }
};

export const approveLeave = async (leaveId: number): Promise<LeaveRecord> => {
    try {
        const response = await api.post(`/leaves/${leaveId}/approve/`);
        return response.data;
    } catch (error: any) {
        console.error("Failed to approve leave:", error);
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Failed to approve leave. Please try again.');
    }
};

export const rejectLeave = async (leaveId: number, reason: string): Promise<LeaveRecord> => {
    try {
        const response = await api.post(`/leaves/${leaveId}/reject/`, { reason });
        return response.data;
    } catch (error: any) {
        console.error("Failed to reject leave:", error);
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Failed to reject leave. Please try again.');
    }
};

export const cancelLeave = async (leaveId: number): Promise<LeaveRecord> => {
    try {
        const response = await api.post(`/leaves/${leaveId}/cancel/`);
        return response.data;
    } catch (error: any) {
        console.error("Failed to cancel leave:", error);
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Failed to cancel leave. Please try again.');
    }
};

export const getDuties = async (): Promise<DutyAssignment[]> => {
    return [];
};
