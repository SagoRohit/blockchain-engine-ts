import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function TextField({ label, id, className = '', ...rest }: TextFieldProps) {
    const inputId = id ?? rest.name;
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={inputId} className="text-sm font-medium text-muted">
                {label}
            </label>
            <input
                id={inputId}
                className={`rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent ${className}`}
                {...rest}
            />
        </div>
    );
}
