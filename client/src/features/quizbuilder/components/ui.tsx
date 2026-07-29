import React from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BadgeColor } from "../types";
import { C } from "../constants";

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
    children: ReactNode;
    color?: BadgeColor;
}

const BADGE_MAP: Record<BadgeColor, [string, string]> = {
    primary: [C.primaryDim, C.primary],
    success: [C.successDim, C.success],
    amber: [C.amberDim, C.amber],
    danger: [C.dangerDim, C.danger],
    purple: [C.purpleDim, C.purple],
};

export const Badge: React.FC<BadgeProps> = ({ children, color = "primary" }) => {
    const [bg, fg] = BADGE_MAP[color];
    return (
        <span
            style={{
                background: bg,
                color: fg,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 20,
                fontFamily: "'Nunito Sans', sans-serif",
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </span>
    );
};

// ─── Field ────────────────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    children: ReactNode;
    hint?: string;
}

export const Field: React.FC<FieldProps> = ({ label, children, hint }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label
            style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.muted,
                fontFamily: "'Nunito Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 0.5,
            }}
        >
            {label}
        </label>
        {children}
        {hint && <span style={{ fontSize: 11, color: C.muted }}>{hint}</span>}
    </div>
);

// ─── TextInput ────────────────────────────────────────────────────────────────

interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    style?: CSSProperties;
}

const inputBase: CSSProperties = {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: 13,
    color: C.text,
    background: C.surface,
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    padding: "9px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color .15s",
    resize: "none",
};

export const TextInput: React.FC<TextInputProps> = ({
    value,
    onChange,
    placeholder,
    multiline = false,
    rows = 2,
    style = {},
}) => {
    const merged: CSSProperties = { ...inputBase, ...style };
    const events = {
        onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            e.target.style.borderColor = C.primary;
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            e.target.style.borderColor = C.border;
        },
    };

    return multiline ? (
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            style={merged}
            {...events}
        />
    ) : (
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={merged}
            {...events}
        />
    );
};