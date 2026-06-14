import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
};

export const userAPI = {
  getUsers: () => API.get('/users'),
  getUserById: (id) => API.get(`/users/${id}`),
  addUser: (user) => API.post('/users', user),
  updateUser: (id, user) => API.put(`/users/${id}`, user),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

export const agentAPI = {
  getAgents: () => API.get('/agents'),
  getAgentById: (id) => API.get(`/agents/${id}`),
  getAgentByUserId: (userId) => API.get(`/agents/user/${userId}`),
  addAgent: (agent) => API.post('/agents', agent),
  updateAgent: (id, agent) => API.put(`/agents/${id}`, agent),
  deleteAgent: (id) => API.delete(`/agents/${id}`),
};

export const assetAPI = {
  getAssets: () => API.get('/assets'),
  getAssetById: (id) => API.get(`/assets/${id}`),
  addAsset: (asset) => API.post('/assets', asset),
  updateAsset: (id, asset) => API.put(`/assets/${id}`, asset),
  deleteAsset: (id) => API.delete(`/assets/${id}`),
};

export const requestAPI = {
  getRequests: (params) => API.get('/service-requests', { params }),
  getRequestById: (id) => API.get(`/service-requests/${id}`),
  createRequest: (request) => API.post('/service-requests', request),
  updateRequest: (id, request) => API.put(`/service-requests/${id}`, request),
  updateRequestStatus: (id, status, resolution) => API.put(`/service-requests/${id}/status`, { status, resolution }),
  escalateRequest: (id) => API.post(`/service-requests/${id}/escalate`),
  deleteRequest: (id) => API.delete(`/service-requests/${id}`),
};

export const assignmentAPI = {
  getAssignments: () => API.get('/assignments'),
  createAssignment: (requestId, agentId) => API.post('/assignments', { requestId, agentId }),
};

export const reportAPI = {
  getSystemReport: () => API.get('/reports'),
};

export default API;
