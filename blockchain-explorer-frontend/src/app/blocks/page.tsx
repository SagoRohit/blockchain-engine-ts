'use client';

import Link from 'next/link';
import { useApiGet } from '@/lib/use-api-get';
import { Table, Th, Td } from '@/components/table';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatAmount, formatDateTime, shortHash } from '@/lib/format';
import type { Block } from '@/lib/types';

export default function BlocksPage() {
    const blocks = useApiGet<Block[]>('/blockchain/blocks');
    const rows = blocks.data ? [...blocks.data].reverse() : [];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Blocks</h1>

            {blocks.loading && <LoadingState />}
            {blocks.error && <ErrorState message={blocks.error} />}
            {!blocks.loading && !blocks.error && rows.length === 0 && (
                <EmptyState message="No blocks yet." />
            )}
            {rows.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <Th>Index</Th>
                            <Th>Hash</Th>
                            <Th>Previous hash</Th>
                            <Th>Miner</Th>
                            <Th>Txs</Th>
                            <Th>Volume</Th>
                            <Th>Mined at</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((block) => (
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
                                <Td className="font-mono">{shortHash(block.previous_hash)}</Td>
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
    );
}
