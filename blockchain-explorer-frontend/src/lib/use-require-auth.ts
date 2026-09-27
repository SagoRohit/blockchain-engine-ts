'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

// Redirects to /login once auth state has hydrated from localStorage and
// there's no token. Pages call this at the top; the backend enforces the
// same rule independently via its global AuthGuard, this just avoids a
// flash of failed requests before redirecting.
export function useRequireAuth() {
    const { token, ready } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (ready && !token) {
            router.replace('/login');
        }
    }, [ready, token, router]);

    return { token, ready };
}
