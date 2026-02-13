import axios from 'axios';
import { Personnel, LeaveRecord, DutyAssignment, PersonnelFormData, SectionData } from './types';

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

// Placeholder for other API calls as we implement them in Backend
export const getLeaves = async (): Promise<LeaveRecord[]> => {
    return [];
};

export const getDuties = async (): Promise<DutyAssignment[]> => {
    return [];
};

