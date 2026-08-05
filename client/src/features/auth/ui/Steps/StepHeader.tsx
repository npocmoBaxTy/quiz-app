import { C } from '@/features/auth/constants'
import { useTranslation } from 'react-i18next'

export const StepHeader = ({ current }: { current: number }) => {
    const { t } = useTranslation();
    return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        {[1, 2].map((s, i) => (
            <>
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: s <= current ? C.primary : C.surfaceHigh, border: `1.5px solid ${s <= current ? C.primary : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: s <= current ? "#fff" : C.muted, transition: "all .25s", flexShrink: 0 }}>
                        {s < current ? <svg width={9} height={7} viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth={2} strokeLinecap="round" /></svg> : s}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: s === current ? 700 : 400, color: s === current ? C.text : C.muted, whiteSpace: "nowrap", transition: "all .25s" }}>
                        {s === 1 ? t("auth.steps.one") : t("auth.steps.two")}
                    </span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: 1.5, background: current > s ? C.primary : C.border, transition: "background .25s" }} />}
            </>
        ))}
    </div>
    );
};