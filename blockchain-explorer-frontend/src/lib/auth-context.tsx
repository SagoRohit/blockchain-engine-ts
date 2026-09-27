'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface AuthUser {
    id: string;
    username: string;
    email: string;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
}

interface AuthContextValue extends AuthState {
    ready: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

const STORAGE_KEY = 'blockchain-explorer.auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({ user: null, token: null });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // One-time hydration from localStorage, which isn't available
        // during server rendering — this can't be a lazy useState
        // initializer without causing a hydration mismatch.
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setState(JSON.parse(raw));
            }
        } catch {
            // ignore malformed/unavailable storage, just start logged out
        } finally {
            setReady(true);
        }
    }, []);

    const login = (token: string, user: AuthUser) => {
        const next = { token, user };
        setState(next);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const logout = () => {
        setState({ user: null, token: null });
        window.localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ ...state, ready, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
