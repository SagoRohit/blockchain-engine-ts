'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/use-require-auth';
import { useApiGet } from '@/lib/use-api-get';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { AddressInput } from '@/components/AddressInput';
import { Table, Th, Td } from '@/components/table';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatDateTime, shortHash } from '@/lib/format';
import type { WatchlistEntry } from '@/lib/types';

export default function WatchlistPage() {
    const { token, ready } = useRequireAuth();
    const watchlist = useApiGet<WatchlistEntry[]>(ready && token ? '/watchlist' : null, token);

    const [address, setAddress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);

    async function handleAdd(event: FormEvent) {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await apiFetch('/watchlist', { method: 'POST', body: { address }, token });
            setAddress('');
            watchlist.refetch();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRemove(watchedAddress: string) {
        setRemoving(watchedAddress);
        try {
            await apiFetch(`/watchlist/${watchedAddress}`, { method: 'DELETE', token });
            watchlist.refetch();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setRemoving(null);
        }
    }

    if (!ready || !token) {
        return <LoadingState />;
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Watchlist</h1>

            <Card>
                <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    {error && (
                        <div className="sm:basis-full">
                            <ErrorState message={error} />
                        </div>
                    )}
                    <div className="flex-1">
                        <AddressInput label="Address to watch" value={address} onChange={setAddress} required />
                    </div>
                    <Button type="submit" loading={submitting}>
                        Watch
                    </Button>
                </form>
            </Card>

            {watchlist.loading && <LoadingState />}
            {watchlist.error && <ErrorState message={watchlist.error} />}
            {watchlist.data && watchlist.data.length === 0 && (
                <EmptyState message="You aren't watching any addresses yet." />
            )}
            {watchlist.data && watchlist.data.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <Th>Address</Th>
                            <Th>Watching since</Th>
                            <Th />
                        </tr>
                    </thead>
                    <tbody>
                        {watchlist.data.map((entry) => (
                            <tr key={entry.id}>
                                <Td className="font-mono">
                                    <Link
                                        href={`/addresses/${entry.watched_address}`}
                                        className="text-accent hover:text-accent-hover"
                                    >
                                        {shortHash(entry.watched_address)}
                                    </Link>
                                </Td>
                                <Td>{formatDateTime(entry.created_at)}</Td>
                                <Td>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemove(entry.watched_address)}
                                        loading={removing === entry.watched_address}
                                    >
                                        Remove
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}
