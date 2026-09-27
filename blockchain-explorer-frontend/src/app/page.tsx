'use client';

import Link from 'next/link';
import { useApiGet } from '@/lib/use-api-get';
import { StatTile } from '@/components/StatTile';
import { Table, Th, Td } from '@/components/table';
import { LoadingState, ErrorState } from '@/components/States';
import { formatAmount, formatDateTime, shortHash } from '@/lib/format';
import type { Block, NetworkInfo } from '@/lib/types';

export default function DashboardPage() {
    const info = useApiGet<NetworkInfo>('/blockchain/info');
    const blocks = useApiGet<Block[]>('/blockchain/blocks');

    const latestBlocks = blocks.data ? [...blocks.data].reverse().slice(0, 5) : [];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-xl font-semibold">Network overview</h1>
                <p className="mt-1 text-sm text-muted">
                    A database-backed blockchain explorer, wallet, and mining dashboard.
                </p>
            </div>

            {info.loading && <LoadingState label="Loading network stats…" />}
            {info.error && <ErrorState message={info.error} />}
            {info.data && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    <StatTile label="Chain height" value={info.data.height} />
                    <StatTile label="Difficulty" value={info.data.difficulty} />
                    <StatTile label="Mining reward" value={info.data.miningReward} />
                    <StatTile label="Transactions" value={info.data.total_transactions} />
                    <StatTile label="Total volume" value={formatAmount(info.data.total_volume)} />
                </div>
            )}

            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Latest blocks</h2>
                    <Link href="/blocks" className="text-sm text-accent hover:text-accent-hover">
                        View all
                    </Link>
                </div>

                {blocks.loading && <LoadingState />}
                {blocks.error && <ErrorState message={blocks.error} />}
                {!blocks.loading && !blocks.error && (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Index</Th>
                                <Th>Hash</Th>
                                <Th>Miner</Th>
                                <Th>Txs</Th>
                                <Th>Volume</Th>
                                <Th>Mined at</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestBlocks.map((block) => (
                                <tr key={block.id}>
                                    <Td>
                                        <Link
                                            href={`/blocks/${block.index}`}
                                            className="text-accent hover:text-accent-hover"
                                        >
                                            #{block.index}
                                        </Link>
                                    </Td>
                                    <Td className="font-mono">{shortHash(block.hash)}</Td>
                                    <Td className="font-mono">{shortHash(block.miner_address)}</Td>
                                    <Td>{block.transaction_count}</Td>
                                    <Td>{formatAmount(block.total_volume)}</Td>
                                    <Td>{formatDateTime(block.mined_at)}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
}
