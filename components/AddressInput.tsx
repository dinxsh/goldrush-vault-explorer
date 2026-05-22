"use client";

interface Props {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export default function AddressInput({ value, onChange, placeholder }: Props) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            style={{
                background: "var(--card)",
                color: "var(--text-primary)",
                borderColor: "var(--border)",
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            }}
            className="w-full rounded border px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text-secondary)]"
        />
    );
}
