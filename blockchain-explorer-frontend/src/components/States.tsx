export function LoadingState({ label = 'Loading…' }: { label?: string }) {
    return <p className="py-8 text-center text-sm text-muted">{label}</p>;
}

export function ErrorState({ message }: { message: string }) {
    return (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {message}
        </p>
    );
}

export function EmptyState({ message }: { message: string }) {
    return <p className="py-8 text-center text-sm text-muted">{message}</p>;
}
