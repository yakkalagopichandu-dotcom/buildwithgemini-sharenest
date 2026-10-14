import axios from 'axios';
import { Donation, CareHome, DashboardMetrics } from '../types';

const API_BASE = '/api';

export const getApiClient = (userId: string = 'demo-user-123') => {
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
      'X-User-Role': 'ADMIN',
    },
  });
};

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const res = await axios.get(`${API_BASE}/dashboard/metrics`);
  return res.data;
};

export const fetchCategories = async () => {
  const res = await axios.get(`${API_BASE}/dashboard/categories`);
  return res.data;
};

export const fetchDonations = async (categoryOrSubcat?: string, status?: string): Promise<Donation[]> => {
  const params: Record<string, string> = {};
  if (categoryOrSubcat) {
    // If it contains a hyphen, it's a specific subcategory id (e.g. cooked-meals, rice-grains, fruits-veggies)
    if (categoryOrSubcat.includes('-')) {
      params.subcategory = categoryOrSubcat;
    } else {
      params.category = categoryOrSubcat;
    }
  }
  if (status) params.status = status;
  const res = await axios.get(`${API_BASE}/donations`, { params });
  return res.data;
};

export const createDonation = async (data: any, client = getApiClient()) => {
  const res = await client.post('/donations', data);
  return res.data;
};

export const fetchCareHomes = async (status?: string): Promise<CareHome[]> => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const res = await axios.get(`${API_BASE}/care-homes`, { params });
  return res.data;
};

export const fetchCareHomeStatus = async (homeId: string): Promise<CareHome> => {
  const res = await axios.get(`${API_BASE}/care-homes/status/${homeId}`);
  return res.data;
};

export const saveCareHome = async (data: any, client = getApiClient()) => {
  const res = await client.post('/care-homes', data);
  return res.data;
};

export const claimDonation = async (donationId: string, client = getApiClient()) => {
  const res = await client.post('/claims', { donation_id: donationId });
  return res.data;
};

export const inspectDonation = async (data: any, client = getApiClient()) => {
  const res = await client.post('/claims/inspect', data);
  return res.data;
};

export const reviewCareHome = async (homeId: string, action: string, notes: string, client = getApiClient()) => {
  const res = await client.post(`/admin/review/${homeId}`, { action, review_notes: notes });
  return res.data;
};

export const sendChatMessage = async (message: string, language: string = 'en', client = getApiClient()) => {
  const res = await client.post('/chat', { message, language });
  return res.data;
};

export const registerUser = async (data: any) => {
  const res = await axios.post(`${API_BASE}/auth/register`, data);
  return res.data;
};

export const fetchAdminQueue = async (client = getApiClient()): Promise<CareHome[]> => {
  const res = await client.get('/admin/queue');
  return res.data;
};
