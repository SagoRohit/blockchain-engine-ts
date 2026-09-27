import type { ReactNode } from 'react';

export function Th({ children }: { children?: ReactNode }) {
    return (
        <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
            {children}
        </th>
    );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <td className={`border-b border-border px-3 py-2 text-sm ${className}`}>{children}</td>;
}

export function Table({ children }: { children: ReactNode }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse bg-surface">{children}</table>
        </div>
    );
}
