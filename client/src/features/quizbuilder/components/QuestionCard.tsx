import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question, Answer } from "../types";
import { C, uid } from "../constants";
import { Badge, Field, TextInput } from "./ui";
import { DragHandle } from "./DragHandle";

interface QuestionCardProps {
    q: Question;
    idx: number;
    onChange: (updated: Question) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    q, idx, onChange, onDelete, onDuplicate,
}) => {
    const [open, setOpen] = useState(true);

    // ── dnd-kit sortable hook ─────────────────────────────────────────────────
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: q.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.38 : 1,
        zIndex: isDragging ? 999 : undefined,
    };

    // ── helpers ───────────────────────────────────────────────────────────────
    const correctIdx = q.answers.findIndex(a => a.correct);
    const valid =
        q.text.trim() !== "" &&
        correctIdx !== -1 &&
        q.answers.every(a => a.text.trim() !== "");

    const setCorrect = (ai: number): void =>
        onChange({ ...q, answers: q.answers.map((a, i) => ({ ...a, correct: i === ai })) });

    const updateAns = (ai: number, text: string): void =>
        onChange({ ...q, answers: q.answers.map((a, i) => (i === ai ? { ...a, text } : a)) });

    const addAns = (): void => {
        if (q.answers.length >= 6) return;
        onChange({ ...q, answers: [...q.answers, { id: uid(), text: "", correct: false }] });
    };

    const delAns = (ai: number): void => {
        if (q.answers.length <= 2) return;
        const next = q.answers.filter((_, i) => i !== ai);
        // if we deleted the correct answer, reset to none
        const hadCorrect = q.answers[ai].correct;
        onChange({ ...q, answers: hadCorrect ? next.map(a => ({ ...a, correct: false })) : next });
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div ref={setNodeRef} style={style}>
            <div
                style={{
                    background: C.surface,
                    border: `1.5px solid ${valid ? C.border : "#f0c4c4"}`,
                    borderRadius: 16,
                    overflow: "hidden",
                    transition: "border-color .2s",
                }}
            >
                {/* ── Header ── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 14px",
                        background: open ? C.surface : C.surfaceHigh,
                        borderBottom: open ? `1px solid ${C.border}` : "none",
                    }}
                >
                    <DragHandle listeners={listeners} attributes={attributes} />

                    {/* number badge */}
                    <div
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            background: valid ? C.primaryDim : "#fef0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                            color: valid ? C.primary : C.danger,
                            fontFamily: "'Nunito', sans-serif",
                            flexShrink: 0,
                        }}
                    >
                        {idx + 1}
                    </div>

                    {/* title – click to expand/collapse */}
                    <div
                        onClick={() => setOpen(o => !o)}
                        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: q.text ? C.text : C.muted,
                                fontFamily: "'Nunito Sans', sans-serif",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {q.text || "Введите текст вопроса..."}
                        </div>
                        <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                            <Badge color={valid ? "success" : "danger"}>
                                {valid ? "готов" : "не заполнен"}
                            </Badge>
                            <Badge color="primary">{q.answers.length} вар.</Badge>
                            <Badge color="amber">{q.points} б.</Badge>
                        </div>
                    </div>

                    {/* action buttons */}
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <button
                            onClick={e => { e.stopPropagation(); onDuplicate(); }}
                            title="Дублировать"
                            style={{
                                background: C.surfaceHigh,
                                border: "none",
                                borderRadius: 7,
                                width: 28,
                                height: 28,
                                cursor: "pointer",
                                color: C.muted,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                <rect x={5} y={5} width={9} height={9} rx={2} />
                                <path d="M3 11V3a2 2 0 0 1 2-2h8" />
                            </svg>
                        </button>

                        <button
                            onClick={e => { e.stopPropagation(); onDelete(); }}
                            title="Удалить"
                            style={{
                                background: C.dangerDim,
                                border: "none",
                                borderRadius: 7,
                                width: 28,
                                height: 28,
                                cursor: "pointer",
                                color: C.danger,
                                fontSize: 15,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ×
                        </button>

                        <div
                            onClick={() => setOpen(o => !o)}
                            style={{
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: C.muted,
                                fontSize: 11,
                                cursor: "pointer",
                            }}
                        >
                            {open ? "▲" : "▼"}
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                {open && (
                    <div
                        style={{
                            padding: "16px 18px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                        }}
                    >
                        <Field label="Текст вопроса">
                            <TextInput
                                value={q.text}
                                onChange={v => onChange({ ...q, text: v })}
                                placeholder="Напишите вопрос..."
                                multiline
                                rows={2}
                            />
                        </Field>

                        <Field
                            label="Варианты ответов"
                            hint="Нажмите на кружок, чтобы отметить правильный ответ"
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                {q.answers.map((a: Answer, ai: number) => (
                                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {/* correct toggle */}
                                        <button
                                            onClick={() => setCorrect(ai)}
                                            title="Отметить правильным"
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: "50%",
                                                border: `2px solid ${a.correct ? C.success : C.border}`,
                                                background: a.correct ? C.success : "transparent",
                                                cursor: "pointer",
                                                flexShrink: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all .15s",
                                            }}
                                        >
                                            {a.correct && (
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                                            )}
                                        </button>

                                        {/* answer text */}
                                        <div style={{ flex: 1, position: "relative" }}>
                                            <input
                                                value={a.text}
                                                onChange={e => updateAns(ai, e.target.value)}
                                                placeholder={`Вариант ${ai + 1}`}
                                                style={{
                                                    width: "100%",
                                                    boxSizing: "border-box",
                                                    fontFamily: "'Nunito Sans', sans-serif",
                                                    fontSize: 13,
                                                    border: `1.5px solid ${a.correct ? C.success + "80" : C.border}`,
                                                    background: a.correct ? C.successDim : C.surface,
                                                    borderRadius: 10,
                                                    padding: "8px 32px 8px 12px",
                                                    outline: "none",
                                                    color: C.text,
                                                    fontWeight: a.correct ? 600 : 400,
                                                    transition: "all .15s",
                                                }}
                                                onFocus={e => (e.target.style.borderColor = a.correct ? C.success : C.primary)}
                                                onBlur={e => (e.target.style.borderColor = a.correct ? C.success + "80" : C.border)}
                                            />
                                            {a.correct && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        right: 10,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        fontSize: 13,
                                                        color: C.success,
                                                    }}
                                                >
                                                    ✓
                                                </span>
                                            )}
                                        </div>

                                        {/* delete answer */}
                                        <button
                                            onClick={() => delAns(ai)}
                                            disabled={q.answers.length <= 2}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: q.answers.length > 2 ? "pointer" : "not-allowed",
                                                color: q.answers.length > 2 ? C.danger : C.border,
                                                fontSize: 18,
                                                padding: "2px 6px",
                                                flexShrink: 0,
                                                lineHeight: 1,
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                {q.answers.length < 6 && (
                                    <button
                                        onClick={addAns}
                                        style={{
                                            background: "none",
                                            border: `1.5px dashed ${C.border}`,
                                            borderRadius: 10,
                                            padding: "7px",
                                            cursor: "pointer",
                                            color: C.muted,
                                            fontFamily: "'Nunito Sans', sans-serif",
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                    >
                                        + Добавить вариант
                                    </button>
                                )}
                            </div>
                        </Field>

                        {/* points + explanation */}
                        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12 }}>
                            <Field label="Баллы">
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={q.points}
                                    onChange={e => onChange({ ...q, points: Math.max(1, Number(e.target.value) || 1) })}
                                    style={{
                                        fontFamily: "'Nunito Sans', sans-serif",
                                        fontSize: 13,
                                        border: `1.5px solid ${C.border}`,
                                        borderRadius: 10,
                                        padding: "9px 12px",
                                        outline: "none",
                                        color: C.text,
                                        background: C.surface,
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </Field>
                            <Field label="Пояснение (необязательно)">
                                <TextInput
                                    value={q.explanation}
                                    onChange={v => onChange({ ...q, explanation: v })}
                                    placeholder="Отображается после ответа студента..."
                                    multiline
                                    rows={1}
                                />
                            </Field>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};