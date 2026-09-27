'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        </AuthProvider>
    );
}
