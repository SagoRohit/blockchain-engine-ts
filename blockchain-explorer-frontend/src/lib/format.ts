export function shortHash(value: string, lead = 8, tail = 6): string {
    if (value.length <= lead + tail + 3) return value;
    return `${value.slice(0, lead)}...${value.slice(-tail)}`;
}

export function formatAmount(value: string | number): string {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 8 });
}

export function formatDateTime(value: string): string {
    return new Date(value).toLocaleString();
}
