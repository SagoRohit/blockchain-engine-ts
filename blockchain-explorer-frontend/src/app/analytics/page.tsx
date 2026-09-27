'use client';

import Link from 'next/link';
import { useApiGet } from '@/lib/use-api-get';
import { Table, Th, Td } from '@/components/table';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatAmount, formatDateTime } from '@/lib/format';
import type { ActiveAddress, LeaderboardBlock, TopWallet } from '@/lib/types';

export default function AnalyticsPage() {
    const topWallets = useApiGet<TopWallet[]>('/blockchain/stats/top-wallets');
    const mostActive = useApiGet<ActiveAddress[]>('/blockchain/stats/most-active');
    const leaderboard = useApiGet<LeaderboardBlock[]>('/blockchain/stats/block-leaderboard');

    return (
        <div className="flex flex-col gap-10">
            <h1 className="text-xl font-semibold">Analytics</h1>

            <section>
                <h2 className="mb-3 text-lg font-semibold">Top wallets</h2>
                {topWallets.loading && <LoadingState />}
                {topWallets.error && <ErrorState message={topWallets.error} />}
                {topWallets.data && topWallets.data.length === 0 && (
                    <EmptyState message="No confirmed balances yet." />
                )}
                {topWallets.data && topWallets.data.length > 0 && (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Owner</Th>
                                <Th>Address</Th>
                                <Th>Balance</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {topWallets.data.map((w) => (
                                <tr key={w.address}>
                                    <Td>{w.username}</Td>
                                    <Td className="font-mono">
                                        <Link
                                            href={`/addresses/${w.address}`}
                                            className="text-accent hover:text-accent-hover"
                                        >
                                            {w.address.slice(0, 14)}…
                                        </Link>
                                    </Td>
                                    <Td>{formatAmount(w.balance)}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </section>

            <section>
                <h2 className="mb-3 text-lg font-semibold">Most active addresses</h2>
                {mostActive.loading && <LoadingState />}
                {mostActive.error && <ErrorState message={mostActive.error} />}
                {mostActive.data && mostActive.data.length === 0 && (
                    <EmptyState message="No confirmed transactions yet." />
                )}
                {mostActive.data && mostActive.data.length > 0 && (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Address</Th>
                                <Th>Transactions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostActive.data.map((a) => (
                                <tr key={a.address}>
                                    <Td className="font-mono">
                                        <Link
                                            href={`/addresses/${a.address}`}
                                            className="text-accent hover:text-accent-hover"
                                        >
                                            {a.address.slice(0, 14)}…
                                        </Link>
                                    </Td>
                                    <Td>{a.transaction_count}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </section>

            <section>
                <h2 className="mb-3 text-lg font-semibold">Block leaderboard</h2>
                {leaderboard.loading && <LoadingState />}
                {leaderboard.error && <ErrorState message={leaderboard.error} />}
                {leaderboard.data && leaderboard.data.length === 0 && (
                    <EmptyState message="No blocks with transactions yet." />
                )}
                {leaderboard.data && leaderboard.data.length > 0 && (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Block</Th>
                                <Th>Miner</Th>
                                <Th>Txs</Th>
                                <Th>Volume</Th>
                                <Th>Mined at</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.data.map((b) => (
                                <tr key={b.hash}>
                                    <Td>
                                        <Link
                                            href={`/blocks/${b.index}`}
                                            className="text-accent hover:text-accent-hover"
                                        >
                                            #{b.index}
                                        </Link>
                                    </Td>
                                    <Td>{b.miner_username}</Td>
                                    <Td>{b.transaction_count}</Td>
                                    <Td>{formatAmount(b.total_volume)}</Td>
                                    <Td>{formatDateTime(b.mined_at)}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </section>
        </div>
    );
}
