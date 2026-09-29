'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { shortHash } from '@/lib/format';

interface UsernameMatch {
    username: string;
    address: string;
}

interface AddressInputProps {
    label: string;
    value: string;
    onChange: (address: string) => void;
    required?: boolean;
}

// A "To address" field that still accepts a raw pasted address (typed
// text is used as-is), but also searches by username as you type and
// lets you pick a match instead of copying a 130-character hex string.
export function AddressInput({ label, value, onChange, required }: AddressInputProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<UsernameMatch[]>([]);
    const [open, setOpen] = useState(false);

    // Only syncs on an explicit external reset (e.g. the form clearing
    // itself after a successful submit) — not on every keystroke, which
    // would otherwise stomp the friendly "username" display text with the
    // resolved address after picking a suggestion.
    useEffect(() => {
        if (value === '' && query !== '') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
        if (query.trim().length < 2) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSuggestions([]);
            return;
        }

        let cancelled = false;
        const handle = setTimeout(() => {
            apiFetch<UsernameMatch[]>(`/wallet/search?username=${encodeURIComponent(query.trim())}`)
                .then((results) => {
                    if (!cancelled) setSuggestions(results);
                })
                .catch(() => {
                    if (!cancelled) setSuggestions([]);
                });
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [query]);

    function handleInputChange(text: string) {
        setQuery(text);
        onChange(text);
        setOpen(true);
    }

    function handleSelect(match: UsernameMatch) {
        setQuery(match.username);
        onChange(match.address);
        setSuggestions([]);
        setOpen(false);
    }

    return (
        <div className="relative flex flex-col gap-1">
            <label className="text-sm font-medium text-muted">{label}</label>
            <input
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Username or wallet address"
                required={required}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {open && suggestions.length > 0 && (
                <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-sm">
                    {suggestions.map((match) => (
                        <li key={match.address}>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelect(match)}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                            >
                                <span className="font-medium">{match.username}</span>{' '}
                                <span className="font-mono text-xs text-muted">
                                    {shortHash(match.address, 8, 6)}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
