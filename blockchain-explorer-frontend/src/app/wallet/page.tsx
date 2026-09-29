'use client';

import { useState, type FormEvent } from 'react';
import { useRequireAuth } from '@/lib/use-require-auth';
import { useApiGet } from '@/lib/use-api-get';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { AddressInput } from '@/components/AddressInput';
import { StatTile } from '@/components/StatTile';
import { Table, Th, Td } from '@/components/table';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatAmount, formatDateTime, shortHash } from '@/lib/format';
import type { StatementEntry, WalletSummary } from '@/lib/types';

export default function WalletPage() {
    const { token, ready } = useRequireAuth();
    const wallets = useApiGet<WalletSummary[]>(ready && token ? '/wallet/mine' : null, token);
    const [selected, setSelected] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);

    const address = selected || wallets.data?.[0]?.address || '';

    const balance = useApiGet<{ address: string; balance: number }>(
        address ? `/blockchain/balance/${address}` : null,
    );
    const statement = useApiGet<StatementEntry[]>(
        address ? `/blockchain/wallets/${address}/statement` : null,
    );

    async function handleCreateWallet() {
        setCreating(true);
        setCreateError(null);
        setCreateSuccess(null);
        try {
            const { address: newAddress } = await apiFetch<{ address: string }>('/wallet', {
                method: 'POST',
                token,
            });
            setSelected(newAddress);
            wallets.refetch();
            setCreateSuccess(`New wallet created: ${shortHash(newAddress)} (now selected below).`);
        } catch (err) {
            setCreateError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setCreating(false);
        }
    }

    if (!ready || !token) {
        return <LoadingState />;
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 key="heading" className="text-xl font-semibold">My wallet</h1>

            {wallets.loading && <LoadingState key="wallets-loading" />}
            {wallets.error && <ErrorState key="wallets-error" message={wallets.error} />}

            {wallets.data && wallets.data.length === 0 && (
                <Card key="no-wallet">
                    <p className="mb-3 text-sm text-muted">You don&apos;t have a wallet yet.</p>
                    {createError && <ErrorState message={createError} />}
                    <Button onClick={handleCreateWallet} loading={creating}>
                        Create a wallet
                    </Button>
                </Card>
            )}

            {wallets.data && wallets.data.length > 0 && (
                <div key="wallet-details" className="contents">
                    <Card className="flex flex-col gap-3">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className="text-sm font-medium text-muted">Active wallet</label>
                            <select
                                value={address}
                                onChange={(e) => setSelected(e.target.value)}
                                className="w-full min-w-0 truncate rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
                            >
                                {wallets.data.map((w) => (
                                    <option key={w.address} value={w.address}>
                                        {shortHash(w.address, 12, 8)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {createError && <ErrorState message={createError} />}
                        {createSuccess && <p className="text-sm text-success">{createSuccess}</p>}
                        <Button variant="secondary" onClick={handleCreateWallet} loading={creating}>
                            Create another wallet
                        </Button>
                    </Card>

                    {balance.data && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <StatTile label="Balance" value={formatAmount(balance.data.balance)} />
                            <StatTile label="Address" value={`${address.slice(0, 16)}…`} />
                        </div>
                    )}

                    <SendTransactionForm
                        from={address}
                        token={token}
                        onSent={() => {
                            balance.refetch();
                            statement.refetch();
                        }}
                    />

                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Statement</h2>
                        {statement.loading && <LoadingState />}
                        {statement.error && <ErrorState message={statement.error} />}
                        {statement.data && statement.data.length === 0 && (
                            <EmptyState message="No confirmed transactions yet." />
                        )}
                        {statement.data && statement.data.length > 0 && (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Hash</Th>
                                        <Th>Direction</Th>
                                        <Th>Amount</Th>
                                        <Th>Running balance</Th>
                                        <Th>Confirmed at</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statement.data.map((entry) => (
                                        <tr key={entry.tx_hash}>
                                            <Td className="font-mono">{entry.tx_hash.slice(0, 12)}…</Td>
                                            <Td>{entry.to_address === address ? 'In' : 'Out'}</Td>
                                            <Td>{formatAmount(entry.amount)}</Td>
                                            <Td>{formatAmount(entry.running_balance)}</Td>
                                            <Td>{entry.confirmed_at ? formatDateTime(entry.confirmed_at) : '—'}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SendTransactionForm({
    from,
    token,
    onSent,
}: {
    from: string;
    token: string | null;
    onSent: () => void;
}) {
    const [to, setTo] = useState('');
    const [amount, setAmount] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSending(true);
        setError(null);
        setSuccess(null);
        try {
            await apiFetch('/blockchain/transactions', {
                method: 'POST',
                body: { from, to, amount: Number(amount) },
                token,
            });
            setSuccess('Transaction submitted — it will confirm once mined.');
            setTo('');
            setAmount('');
            onSent();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setSending(false);
        }
    }

    return (
        <Card>
            <h2 className="mb-3 text-lg font-semibold">Send a transaction</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {error && (
                    <div className="sm:basis-full">
                        <ErrorState message={error} />
                    </div>
                )}
                <div className="flex-1">
                    <AddressInput label="To address" value={to} onChange={setTo} required />
                </div>
                <div className="w-32">
                    <TextField
                        label="Amount"
                        name="amount"
                        type="number"
                        min={0}
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" loading={sending}>
                    Send
                </Button>
            </form>
            {success && <p className="mt-3 text-sm text-success">{success}</p>}
        </Card>
    );
}
