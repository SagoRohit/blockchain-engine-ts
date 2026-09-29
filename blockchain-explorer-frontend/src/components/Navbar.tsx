'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const LINKS = [
    { href: '/', label: 'Dashboard' },
    { href: '/blocks', label: 'Blocks' },
    { href: '/pending', label: 'Pending' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/analytics', label: 'Analytics' },
];

export function Navbar() {
    const { user, logout, ready } = useAuth();
    const router = useRouter();

    return (
        <header className="border-b border-border bg-surface">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex flex-wrap items-center gap-5">
                    <Link href="/" className="text-sm font-semibold text-foreground">
                        GRuby
                    </Link>
                    <nav className="flex flex-wrap gap-4 text-sm text-muted">
                        {LINKS.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-foreground">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {ready && (
                    <div className="flex items-center gap-3 text-sm">
                        {user ? (
                            <>
                                <span className="text-muted">{user.username}</span>
                                <button
                                    onClick={() => {
                                        logout();
                                        router.push('/');
                                    }}
                                    className="text-accent hover:text-accent-hover"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-accent hover:text-accent-hover">
                                    Log in
                                </Link>
                                <Link href="/register" className="text-accent hover:text-accent-hover">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
