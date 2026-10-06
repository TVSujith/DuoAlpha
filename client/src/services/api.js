import { io } from 'socket.io-client';

const API_BASE = 'https://duoalpha.onrender.com/api';

export function getAuthToken() {
  return localStorage.getItem('duoalpha_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('duoalpha_token', token);
  } else {
    localStorage.removeItem('duoalpha_token');
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('duoalpha_user');
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('duoalpha_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('duoalpha_user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    setAuthToken(null);
    setCurrentUser(null);
    window.location.reload();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// Socket singleton
let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io('https://duoalpha.onrender.com', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });
  }
  return socketInstance;
}
