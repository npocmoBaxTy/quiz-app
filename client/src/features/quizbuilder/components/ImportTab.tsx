import React, { useCallback, useRef, useState } from "react";
import type { ParsedImport, Question } from "../types";
import { C, uid } from "../constants";
import { Badge } from "./ui";
import { Btn } from "./Btn";

interface ImportTabProps {
    onImport: (questions: Question[]) => void;
}

// ── Parser ────────────────────────────────────────────────────────────────────

async function parseFile(file: File): Promise<Question[]> {
    const text = await file.text();
    const questions: Question[] = [];

    if (file.name.endsWith(".json")) {
        const data = JSON.parse(text) as unknown;
        const arr: unknown[] = Array.isArray(data)
            ? data
            : (data as Record<string, unknown>).questions as unknown[] ?? [];

        for (const raw of arr) {
            const q = raw as Record<string, unknown>;
            const answers = (
                (q.answers ?? q.options) as Array<unknown>
            ).map((a: unknown, i: number) => ({
                id: uid(),
                text: typeof a === "string" ? a : (a as Record<string, string>).text ?? "",
                correct: typeof a === "object"
                    ? Boolean((a as Record<string, unknown>).correct ?? (a as Record<string, unknown>).isCorrect)
                    : (q.correct === i || q.correctIndex === i),
            }));
            if (!q.text || answers.length < 2) continue;
            questions.push({
                id: uid(),
                text: String(q.text ?? q.question ?? ""),
                points: Number(q.points) || 1,
                explanation: String(q.explanation ?? ""),
                answers,
            });
        }
    } else if (file.name.endsWith(".csv")) {
        const lines = text.trim().split("\n").filter(Boolean);
        const header = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        for (const line of lines.slice(1)) {
            const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
            const row: Record<string, string> = {};
            header.forEach((h, i) => { row[h] = cols[i] ?? ""; });
            if (!row.question && !row.text) continue;
            const ans = [row.a, row.b, row.c, row.d].filter(Boolean);
            if (ans.length < 2) continue;
            const correctMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
            const ci = correctMap[(row.correct ?? "a").toLowerCase()] ?? 0;
            questions.push({
                id: uid(),
                text: row.question ?? row.text ?? "",
                points: parseInt(row.points ?? "1", 10) || 1,
                explanation: row.explanation ?? "",
                answers: ans.map((t, i) => ({ id: uid(), text: t, correct: i === ci })),
            });
        }
    }

    return questions;
}

// ── Format hint card ──────────────────────────────────────────────────────────

interface FormatCardProps {
    ext: string;
    color: "primary" | "amber";
    lines: string[];
}

const FormatCard: React.FC<FormatCardProps> = ({ ext, color, lines }) => (
    <div
        style={{
            background: C.surfaceHigh,
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            padding: 14,
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Badge color={color}>.{ext}</Badge>
            <span style={{ fontSize: 12, color: C.muted, fontFamily: "'Nunito Sans', sans-serif" }}>формат</span>
        </div>
        <pre
            style={{
                margin: 0,
                fontSize: 10.5,
                fontFamily: "monospace",
                color: C.text,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
            }}
        >
            {lines.join("\n")}
        </pre>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const ImportTab: React.FC<ImportTabProps> = ({ onImport }) => {
    const [dragging, setDragging] = useState(false);
    const [result, setResult] = useState<ParsedImport | null>(null);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File): Promise<void> => {
        setError(""); setResult(null);
        try {
            const questions = await parseFile(file);
            if (!questions.length) {
                setError("Не найдено корректных вопросов. Проверьте формат файла.");
                return;
            }
            setResult({ questions, name: file.name });
        } catch (e) {
            setError("Ошибка парсинга файла: " + (e as Error).message);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) void handleFile(f);
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Format hints */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormatCard
                    ext="JSON" color="primary"
                    lines={[
                        `{ "questions": [`,
                        `  { "text": "Вопрос?",`,
                        `    "answers": [{"text":"A","correct":true},...],`,
                        `    "points": 2 }`,
                        `]}`,
                    ]}
                />
                <FormatCard
                    ext="CSV" color="amber"
                    lines={[
                        `question, a, b, c, d, correct, points`,
                        `Вопрос?, A, B, C, D, a, 1`,
                    ]}
                />
            </div>

            {/* Drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragging ? C.primary : C.border}`,
                    borderRadius: 18,
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging ? C.primaryDim : C.surfaceHigh,
                    transition: "all .2s",
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
                    style={{ display: "none" }}
                />
                <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
                <div
                    style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 800,
                        fontSize: 16,
                        color: dragging ? C.primary : C.text,
                        marginBottom: 6,
                    }}
                >
                    {dragging ? "Отпустите файл" : "Перетащите файл или нажмите"}
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: "'Nunito Sans', sans-serif" }}>
                    Поддерживаются .json и .csv
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    style={{
                        background: C.dangerDim,
                        border: `1.5px solid ${C.danger}40`,
                        borderRadius: 12,
                        padding: "12px 16px",
                        fontSize: 13,
                        color: C.danger,
                        fontFamily: "'Nunito Sans', sans-serif",
                    }}
                >
                    ⚠ {error}
                </div>
            )}

            {/* Success preview */}
            {result && (
                <div
                    style={{
                        background: C.successDim,
                        border: `1.5px solid ${C.success}50`,
                        borderRadius: 14,
                        padding: "16px 18px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 10,
                            marginBottom: 12,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 800,
                                    fontSize: 15,
                                    color: C.success,
                                }}
                            >
                                ✓ Найдено {result.questions.length} вопросов в «{result.name}»
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontFamily: "'Nunito Sans', sans-serif" }}>
                                Нажмите «Добавить» чтобы импортировать в тест
                            </div>
                        </div>
                        <Btn
                            variant="success"
                            onClick={() => { onImport(result.questions); setResult(null); }}
                        >
                            Добавить {result.questions.length} вопр. →
                        </Btn>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {result.questions.slice(0, 4).map((q, i) => (
                            <div
                                key={q.id}
                                style={{
                                    background: "#fff",
                                    borderRadius: 8,
                                    padding: "7px 12px",
                                    fontSize: 12,
                                    fontFamily: "'Nunito Sans', sans-serif",
                                    color: C.text,
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "flex-start",
                                }}
                            >
                                <span style={{ color: C.success, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {q.text}
                                </span>
                                <span style={{ color: C.muted, flexShrink: 0 }}>{q.answers.length} вар.</span>
                            </div>
                        ))}
                        {result.questions.length > 4 && (
                            <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: "'Nunito Sans', sans-serif" }}>
                                ...и ещё {result.questions.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};