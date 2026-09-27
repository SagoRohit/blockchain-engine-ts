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

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch<AuthResponse>('/auth/register', {
                method: 'POST',
                body: { username, email, password },
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
            <h1 className="mb-6 text-xl font-semibold">Create an account</h1>
            <Card>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && <ErrorState message={error} />}
                    <TextField
                        label="Username"
                        name="username"
                        minLength={3}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" loading={loading}>
                        Register
                    </Button>
                </form>
            </Card>
            <p className="mt-4 text-sm text-muted">
                Already have an account?{' '}
                <Link href="/login" className="text-accent hover:text-accent-hover">
                    Log in
                </Link>
            </p>
        </div>
    );
}
