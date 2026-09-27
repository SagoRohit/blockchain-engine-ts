'use client';

import { useParams } from 'next/navigation';
import { useApiGet } from '@/lib/use-api-get';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState, ErrorState } from '@/components/States';
import { formatAmount, formatDateTime } from '@/lib/format';
import type { Transaction } from '@/lib/types';

export default function TransactionDetailPage() {
    const params = useParams<{ hash: string }>();
    const tx = useApiGet<Transaction>(`/blockchain/transaction/${params.hash}`);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Transaction</h1>

            {tx.loading && <LoadingState />}
            {tx.error && <ErrorState message={tx.error} />}

            {tx.data && (
                <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Hash" value={tx.data.tx_hash} mono />
                    <Field label="Status" value={<StatusBadge status={tx.data.status} />} />
                    <Field label="From" value={tx.data.from_address ?? 'Mining reward (coinbase)'} mono />
                    <Field label="To" value={tx.data.to_address} mono />
                    <Field label="Amount" value={formatAmount(tx.data.amount)} />
                    <Field label="Created at" value={formatDateTime(tx.data.created_at)} />
                    {tx.data.confirmed_at && (
                        <Field label="Confirmed at" value={formatDateTime(tx.data.confirmed_at)} />
                    )}
                    {tx.data.signature && <Field label="Signature" value={tx.data.signature} mono />}
                </Card>
            )}
        </div>
    );
}

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
            <div className={`mt-0.5 break-all text-sm ${mono ? 'font-mono' : ''}`}>{value}</div>
        </div>
    );
}
