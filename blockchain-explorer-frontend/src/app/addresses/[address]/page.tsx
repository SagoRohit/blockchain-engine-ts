'use client';

import { useParams } from 'next/navigation';
import { useApiGet } from '@/lib/use-api-get';
import { StatTile } from '@/components/StatTile';
import { Table, Th, Td } from '@/components/table';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatAmount, formatDateTime } from '@/lib/format';
import type { StatementEntry } from '@/lib/types';

export default function AddressDetailPage() {
    const params = useParams<{ address: string }>();
    const address = decodeURIComponent(params.address);

    const balance = useApiGet<{ address: string; balance: number }>(
        `/blockchain/balance/${address}`,
    );
    const statement = useApiGet<StatementEntry[]>(`/blockchain/wallets/${address}/statement`);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-semibold">Address</h1>
                <p className="mt-1 break-all font-mono text-sm text-muted">{address}</p>
            </div>

            {balance.loading && <LoadingState />}
            {balance.error && <ErrorState message={balance.error} />}
            {balance.data && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <StatTile label="Balance" value={formatAmount(balance.data.balance)} />
                </div>
            )}

            <div>
                <h2 className="mb-3 text-lg font-semibold">Confirmed history</h2>
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
    );
}
