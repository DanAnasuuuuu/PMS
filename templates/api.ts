import axios from 'axios';
import { Personnel, LeaveRecord, DutyAssignment } from '../types';

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

export const getPersonnel = async (): Promise<Personnel[]> => {
    try {
        const response = await api.get('/personnel/');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch personnel:", error);
        return [];
    }
};

// Placeholder for other API calls as we implement them in Backend
export const getLeaves = async (): Promise<LeaveRecord[]> => {
    // For now return mock if endpoint doesn't exist, but let's assume we want to hit API
    // We haven't created leaves endpoint yet, so let's stick to empty or mock for now in App.tsx
    // Or returning empty array to avoid errors
    return [];
};

export const getDuties = async (): Promise<DutyAssignment[]> => {
    return [];
};
