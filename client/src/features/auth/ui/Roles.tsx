import { C } from "../constants"
import { useTranslation } from "react-i18next"
import { useFormCtx } from "../FormContext/userFormContext"


export const Roles = () => {
    const { t } = useTranslation();
    const { ROLES, role, setRole } = useFormCtx()

    return (
        <div className="mt-5">
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 10, marginLeft: 5 }}>
                {t("auth.labels.role")}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 20 }}>
                {ROLES.map(r => {
                    const active = role === r.val;
                    return (
                        <button key={r.val} type="button" onClick={() => setRole(r.val)}
                            style={{ background: active ? C.primaryDim : C.surfaceHigh, border: `1.5px solid ${active ? C.primary : C.border}`, borderRadius: 11, padding: "11px 13px", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                <span style={{ color: active ? C.primary : C.muted, display: "flex", alignItems: "center", transition: "color .15s" }}>{r.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: 12, color: active ? C.primary : C.text, transition: "color .15s" }}>{r.label}</span>
                                {active && <div style={{ marginLeft: "auto", width: 14, height: 14, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width={7} height={6} viewBox="0 0 8 6" fill="none"><path d="M1 3L3.5 5.5L7.5 1" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" /></svg>
                                </div>}
                            </div>
                            <div style={{ fontSize: 10, color: active ? C.primary : C.muted, lineHeight: 1.4, transition: "color .15s" }}>{r.desc}</div>
                        </button>
                    );
                })}


            </div>

        </div>
    )
}