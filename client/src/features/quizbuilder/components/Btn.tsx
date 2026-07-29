import React from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BtnVariant, BtnSize } from "../types";
import { C } from "../constants";

interface BtnProps {
    onClick?: () => void;
    children: ReactNode;
    variant?: BtnVariant;
    disabled?: boolean;
    loading?: boolean;
    size?: BtnSize;
    style?: CSSProperties;
    title?: string;
    type?: "button" | "submit" | "reset";
}

const VARIANTS: Record<BtnVariant, CSSProperties> = {
    primary: { background: C.primary, color: "#fff" },
    ghost: { background: "transparent", color: C.muted, border: `1.5px solid ${C.border}` },
    danger: { background: C.dangerDim, color: C.danger, border: `1.5px solid ${C.danger}30` },
    success: { background: C.successDim, color: C.success, border: `1.5px solid ${C.success}40` },
    outline: { background: C.surface, color: C.primary, border: `1.5px solid ${C.primaryMid}` },
};

export const Btn: React.FC<BtnProps> = ({
    onClick,
    children,
    variant = "primary",
    disabled = false,
    loading = false,
    size = "md",
    style = {},
    title,
    type = "button",
}) => {
    const base: CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        border: "none",
        fontFamily: "'Nunito Sans', sans-serif",
        fontWeight: 600,
        borderRadius: 12,
        transition: "all .15s",
        outline: "none",
        opacity: disabled || loading ? 0.55 : 1,
        fontSize: size === "sm" ? 12 : 13,
        padding: size === "sm" ? "6px 12px" : "9px 18px",
    };

    return (
        <button
            type={type}
            title={title}
            onClick={disabled || loading ? undefined : onClick}
            style={{ ...base, ...VARIANTS[variant], ...style }}
        >
            {loading && (
                <span
                    style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        border: "2px solid currentColor",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                    }}
                />
            )}
            {children}
        </button>
    );
};