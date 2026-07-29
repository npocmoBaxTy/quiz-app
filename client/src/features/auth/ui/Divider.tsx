import { C } from "../constants";

export const Divider = ({ label }: { label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
);