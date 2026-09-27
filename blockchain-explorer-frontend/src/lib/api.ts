const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

interface ApiFetchOptions {
    method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
    body?: unknown;
    token?: string | null;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const headers: Record<string, string> = {};
    if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : undefined;

    if (!response.ok) {
        const message =
            (data && (Array.isArray(data.message) ? data.message.join(', ') : data.message)) ??
            response.statusText;
        throw new ApiError(message, response.status);
    }

    return data as T;
}
