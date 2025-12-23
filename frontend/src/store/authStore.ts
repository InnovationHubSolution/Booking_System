import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isHost?: boolean;
}

interface AuthState {
    token: string | null;
    userId: string | null;
    user: User | null;
    setAuth: (token: string, userId: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            userId: null,
            user: null,
            setAuth: (token, userId, user) => set({ token, userId, user }),
            logout: () => set({ token: null, userId: null, user: null })
        }),
        {
            name: 'vanuatu-auth'
        }
    )
);
