'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApiGet } from '@/lib/use-api-get';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Table, Th, Td } from '@/components/table';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatAmount, shortHash } from '@/lib/format';
import type { Transaction, WalletSummary } from '@/lib/types';

export default function PendingPage() {
    const { token, ready } = useAuth();
    const pending = useApiGet<Transaction[]>('/blockchain/pending-transactions');
    const wallets = useApiGet<WalletSummary[]>(ready && token ? '/wallet/mine' : null, token);

    const [minerAddress, setMinerAddress] = useState('');
    const [mining, setMining] = useState(false);
    const [mineError, setMineError] = useState<string | null>(null);
    const [mineSuccess, setMineSuccess] = useState<string | null>(null);

    const selected = minerAddress || wallets.data?.[0]?.address || '';

    async function handleMine() {
        if (!selected) return;
        setMining(true);
        setMineError(null);
        setMineSuccess(null);
        try {
            const result = await apiFetch<{ message: string; index: number; hash: string }>(
                '/blockchain/mine',
                { method: 'POST', body: { minerAddress: selected }, token },
            );
            setMineSuccess(`Mined block #${result.index}.`);
            pending.refetch();
        } catch (err) {
            setMineError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setMining(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Pending transactions</h1>

            <Card>
                {!token && (
                    <p className="text-sm text-muted">
                        <Link href="/login" className="text-accent hover:text-accent-hover">
                            Log in
                        </Link>{' '}
                        with a wallet to mine the pending transactions into a new block.
                    </p>
                )}
                {token && wallets.data && wallets.data.length === 0 && (
                    <p className="text-sm text-muted">
                        You need a wallet before you can mine.{' '}
                        <Link href="/wallet" className="text-accent hover:text-accent-hover">
                            Create one
                        </Link>
                        .
                    </p>
                )}
                {token && wallets.data && wallets.data.length > 0 && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <label className="text-sm font-medium text-muted">Mine reward to</label>
                            <select
                                value={selected}
                                onChange={(e) => setMinerAddress(e.target.value)}
                                className="w-full min-w-0 truncate rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
                            >
                                {wallets.data.map((w) => (
                                    <option key={w.address} value={w.address}>
                                        {shortHash(w.address, 12, 8)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleMine} loading={mining} className="shrink-0">
                            {pending.data && pending.data.length > 0
                                ? `Mine ${pending.data.length} pending transaction${pending.data.length === 1 ? '' : 's'}`
                                : 'Mine empty block (reward only)'}
                        </Button>
                    </div>
                )}
                {mineError && (
                    <div className="mt-3">
                        <ErrorState message={mineError} />
                    </div>
                )}
                {mineSuccess && <p className="mt-3 text-sm text-success">{mineSuccess}</p>}
            </Card>

            {pending.loading && <LoadingState />}
            {pending.error && <ErrorState message={pending.error} />}
            {!pending.loading && !pending.error && pending.data?.length === 0 && (
                <EmptyState message="No pending transactions right now." />
            )}
            {pending.data && pending.data.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <Th>Hash</Th>
                            <Th>From</Th>
                            <Th>To</Th>
                            <Th>Amount</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {pending.data.map((tx) => (
                            <tr key={tx.id}>
                                <Td className="font-mono">{tx.tx_hash.slice(0, 12)}…</Td>
                                <Td className="font-mono">{tx.from_address?.slice(0, 10) ?? '—'}…</Td>
                                <Td className="font-mono">{tx.to_address.slice(0, 10)}…</Td>
                                <Td>{formatAmount(tx.amount)}</Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}
