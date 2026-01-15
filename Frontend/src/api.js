// API utility for making requests to backend
const API_BASE = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Only add body if it exists
    if (options.body) {
      fetchOptions.body = options.body;
    }

    const response = await fetch(url, fetchOptions);

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error Response:`, data);
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API call failed: ${endpoint}`, err);
    throw err;
  }
};

// Auth endpoints
export const authAPI = {
  register: (data) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: (data) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  verify: (token) => apiCall('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),
  
  google: (token) => apiCall('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),
};

// Chat endpoints
export const chatAPI = {
  sendMessage: (threadId, message, authToken) => apiCall('/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({ threadId, message }),
  }),
  
  generate: (threadId, message, authToken) => apiCall('/chat/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({ threadId, message }),
  }),
  
  getThreads: (authToken) => apiCall('/chat/thread', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  }),
  
  getThread: (threadId, authToken) => apiCall(`/chat/thread/${threadId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  }),
  
  deleteThread: (threadId, authToken) => apiCall(`/chat/thread/${threadId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  }),
};

// Upload endpoints
export const uploadAPI = {
  upload: (formData, authToken) => fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  }).then(res => res.json()),
};
