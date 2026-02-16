import { useState, useEffect } from 'react';

interface AuthUser {
    id?: string;
    username?: string;
    token: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('ordermate_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('ordermate_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: AuthUser) => {
        localStorage.setItem('ordermate_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('ordermate_user');
        setUser(null);
        window.location.href = '/login';
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user?.token,
        login,
        logout
    };
};
