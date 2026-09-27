'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { ErrorState } from '@/components/States';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { AuthResponse } from '@/lib/types';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch<AuthResponse>('/auth/login', {
                method: 'POST',
                body: { username, password },
            });
            login(res.accessToken, res.user);
            router.push('/');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-sm">
            <h1 className="mb-6 text-xl font-semibold">Log in</h1>
            <Card>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && <ErrorState message={error} />}
                    <TextField
                        label="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" loading={loading}>
                        Log in
                    </Button>
                </form>
            </Card>
            <p className="mt-4 text-sm text-muted">
                No account yet?{' '}
                <Link href="/register" className="text-accent hover:text-accent-hover">
                    Register
                </Link>
            </p>
        </div>
    );
}
