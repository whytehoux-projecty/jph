/**
 * API Client for JPHeritage Unified Bank
 * In demo mode: auth calls hit the local Next.js API routes backed by SQLite.
 * All other calls are mocked gracefully so the UI never crashes.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response) {
            console.error('API error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Network error - no response received');
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

// API Methods
export const api = {
    // ─────────────────────────────────────────────
    // Auth namespace (used by login page)
    // ─────────────────────────────────────────────
    auth: {
        /** Returns portal status — always "online" for demo */
        getPortalStatus: async (): Promise<{ data: { status: string } }> => {
            return { data: { status: 'online' } };
        },

        /** Login: posts to /api/auth/signin (Next.js API route) */
        login: async (credentials: {
            email?: string;
            accountNumber?: string;
            password: string;
        }) => {
            const response = await apiClient.post('/api/auth/signin', credentials);
            return response.data;
        },

        /** Register new customer */
        register: async (userData: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phone: string;
            dateOfBirth: string;
        }) => {
            const response = await apiClient.post('/api/auth/register', userData);
            return response.data;
        },
    },

    // ─────────────────────────────────────────────
    // Portal Health Check
    // ─────────────────────────────────────────────
    checkPortalHealth: async () => {
        return { status: 'online' };
    },

    // ─────────────────────────────────────────────
    // Contact Form
    // ─────────────────────────────────────────────
    submitContactForm: async (formData: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }) => {
        const response = await apiClient.post('/api/contact', formData);
        return response.data;
    },

    // ─────────────────────────────────────────────
    // Account Applications
    // ─────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestAccountOpening: async (applicationData: any) => {
        const response = await apiClient.post('/api/account-applications', applicationData);
        return response.data;
    },
};

export default apiClient;
