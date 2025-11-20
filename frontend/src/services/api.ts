export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const endpoints = {
    chat: `${API_URL}/chat`,
    chatStream: `${API_URL}/chat/stream`,
};
