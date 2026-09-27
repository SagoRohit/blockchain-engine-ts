'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from './api';

// Shared fetch-on-mount pattern: every read-only page in this app needs the
// same {data, loading, error} + refetch shape, so it lives here once instead
// of being copy-pasted into ~8 page components.
export function useApiGet<T>(path: string | null, token?: string | null) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        if (!path) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        apiFetch<T>(path, { token })
            .then((result) => {
                if (!cancelled) setData(result);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof ApiError ? err.message : 'Something went wrong');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [path, token, nonce]);

    return { data, error, loading, refetch: () => setNonce((n) => n + 1) };
}
