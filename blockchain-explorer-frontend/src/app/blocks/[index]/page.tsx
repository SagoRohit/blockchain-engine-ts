'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApiGet } from '@/lib/use-api-get';
import { Card } from '@/components/Card';
import { Table, Th, Td } from '@/components/table';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatAmount, formatDateTime } from '@/lib/format';
import type { BlockDetail } from '@/lib/types';

export default function BlockDetailPage() {
    const params = useParams<{ index: string }>();
    const block = useApiGet<BlockDetail>(`/blockchain/blocks/${params.index}`);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Block #{params.index}</h1>

            {block.loading && <LoadingState />}
            {block.error && <ErrorState message={block.error} />}

            {block.data && (
                <div className="contents">
                    <Card className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Hash" value={block.data.hash} mono />
                        <Field label="Previous hash" value={block.data.previous_hash} mono />
                        <Field label="Miner" value={block.data.miner_address} mono />
                        <Field label="Nonce" value={block.data.nonce} />
                        <Field label="Difficulty" value={block.data.difficulty} />
                        <Field label="Total volume" value={formatAmount(block.data.total_volume)} />
                        <Field label="Mined at" value={formatDateTime(block.data.mined_at)} />
                    </Card>

                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Transactions</h2>
                        {block.data.transactions.length === 0 ? (
                            <EmptyState message="No transactions in this block." />
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Hash</Th>
                                        <Th>From</Th>
                                        <Th>To</Th>
                                        <Th>Amount</Th>
                                        <Th>Status</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {block.data.transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <Td className="font-mono">
                                                <Link
                                                    href={`/transactions/${tx.tx_hash}`}
                                                    className="text-accent hover:text-accent-hover"
                                                >
                                                    {tx.tx_hash.slice(0, 12)}…
                                                </Link>
                                            </Td>
                                            <Td className="font-mono">
                                                {tx.from_address ? `${tx.from_address.slice(0, 10)}…` : 'Reward'}
                                            </Td>
                                            <Td className="font-mono">{tx.to_address.slice(0, 10)}…</Td>
                                            <Td>{formatAmount(tx.amount)}</Td>
                                            <Td>
                                                <StatusBadge status={tx.status} />
                                            </Td>
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

function Field({ label, value, mono = false }: { label: string; value: string | number; mono?: boolean }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
            <p className={`mt-0.5 break-all text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
    );
}
