export function StatusBadge({ status }: { status: 'pending' | 'confirmed' }) {
    const classes =
        status === 'confirmed'
            ? 'bg-success/10 text-success'
            : 'bg-warning/10 text-warning';

    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${classes}`}>
            {status}
        </span>
    );
}
