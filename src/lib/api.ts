const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const storedUser = localStorage.getItem('ordermate_user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'token': token }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API Request failed' }));
        throw new Error(error.message || 'API Request failed');
    }

    return response.json();
}
