import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:bg-accent-hover disabled:bg-accent/50',
    secondary:
        'bg-transparent text-foreground border border-border hover:bg-black/[.03] dark:hover:bg-white/[.06]',
    danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    loading?: boolean;
}

export function Button({
    variant = 'primary',
    loading = false,
    disabled,
    className = '',
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
            {...rest}
        >
            {loading ? 'Please wait…' : children}
        </button>
    );
}
