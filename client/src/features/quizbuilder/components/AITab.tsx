import React, { useState } from "react";
import type { Difficulty, Question, AIQuestion } from "../types";
import { C, uid } from "../constants";
import { Field, TextInput } from "./ui";
import { Btn } from "./Btn";

interface AITabProps {
    onImport: (questions: Question[]) => void;
}

const DIFF_MAP: Record<Difficulty, string> = {
    easy: "лёгкой",
    medium: "средней",
    hard: "высокой",
};

const COUNT_OPTIONS: number[] = [3, 5, 7, 10, 15];
const DIFF_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];
const DIFF_LABELS: Record<Difficulty, string> = {
    easy: "🟢 Лёгкая",
    medium: "🟡 Средняя",
    hard: "🔴 Высокая",
};

// ── Select styles (reused) ────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: 13,
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    padding: "9px 10px",
    background: C.surface,
    color: C.text,
    outline: "none",
    cursor: "pointer",
};

// ── Component ─────────────────────────────────────────────────────────────────

export const AITab: React.FC<AITabProps> = ({ onImport }) => {
    const [topic, setTopic] = useState("");
    const [count, setCount] = useState<number>(5);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Question[] | null>(null);
    const [error, setError] = useState("");
    const [streamText, setStreamText] = useState("");

    const generate = async (): Promise<void> => {
        if (!topic.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        setStreamText("");

        const prompt = `Ты — преподаватель университета. Создай ${count} тестовых вопросов по теме: "${topic}".
Сложность: ${DIFF_MAP[difficulty]}.
Каждый вопрос — один правильный ответ из 4 вариантов.

Ответь ТОЛЬКО валидным JSON, без пояснений, без markdown-блоков:
[
  {
    "text": "Текст вопроса?",
    "answers": [
      {"text": "Вариант A", "correct": true},
      {"text": "Вариант B", "correct": false},
      {"text": "Вариант C", "correct": false},
      {"text": "Вариант D", "correct": false}
    ],
    "points": 1,
    "explanation": "Краткое объяснение правильного ответа"
  }
]`;

        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 3000,
                    stream: true,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            let fullText = "";
            const reader = res.body!.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                for (const line of chunk.split("\n")) {
                    if (!line.startsWith("data: ")) continue;
                    const data = line.slice(6);
                    if (data === "[DONE]") continue;
                    try {
                        const parsed = JSON.parse(data) as {
                            type: string;
                            delta?: { text?: string };
                        };
                        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                            fullText += parsed.delta.text;
                            setStreamText(fullText);
                        }
                    } catch {
                        // partial SSE chunk — skip
                    }
                }
            }

            const match = fullText.match(/\[[\s\S]*\]/);
            if (!match) throw new Error("Не удалось извлечь JSON из ответа");

            const arr = JSON.parse(match[0]) as AIQuestion[];
            setResult(
                arr.map(q => ({
                    id: uid(),
                    text: q.text,
                    points: q.points ?? 1,
                    explanation: q.explanation ?? "",
                    answers: (q.answers ?? []).map(a => ({
                        id: uid(),
                        text: a.text,
                        correct: a.correct,
                    })),
                }))
            );
        } catch (e) {
            setError("Ошибка генерации: " + (e as Error).message);
        } finally {
            setLoading(false);
            setStreamText("");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Info banner */}
            <div
                style={{
                    background: C.purpleDim,
                    border: `1.5px solid ${C.purple}30`,
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                }}
            >
                <span style={{ fontSize: 22 }}>✦</span>
                <div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: C.purple }}>
                        ИИ-генерация вопросов
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            color: C.muted,
                            marginTop: 3,
                            fontFamily: "'Nunito Sans', sans-serif",
                            lineHeight: 1.6,
                        }}
                    >
                        Опишите тему — Claude создаст готовые вопросы с вариантами ответов и пояснениями.
                        Вы сможете отредактировать их перед добавлением.
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px", gap: 12, alignItems: "end" }}>
                <Field label="Тема вопросов">
                    <TextInput
                        value={topic}
                        onChange={setTopic}
                        placeholder="Напр: Теория вероятностей, SQL-запросы, Законы Ньютона..."
                    />
                </Field>

                <Field label="Количество">
                    <select
                        value={count}
                        onChange={e => setCount(Number(e.target.value))}
                        style={selectStyle}
                    >
                        {COUNT_OPTIONS.map(n => (
                            <option key={n} value={n}>{n} вопр.</option>
                        ))}
                    </select>
                </Field>

                <Field label="Сложность">
                    <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value as Difficulty)}
                        style={selectStyle}
                    >
                        {DIFF_OPTIONS.map(d => (
                            <option key={d} value={d}>{DIFF_LABELS[d]}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <Btn
                onClick={() => void generate()}
                disabled={!topic.trim()}
                loading={loading}
                style={{
                    alignSelf: "flex-start",
                    padding: "11px 24px",
                    fontSize: 14,
                    background: loading ? C.purple + "cc" : C.purple,
                    color: "#fff",
                    borderRadius: 12,
                }}
            >
                {loading ? "Генерирую..." : "✦ Сгенерировать вопросы"}
            </Btn>

            {/* Live stream */}
            {loading && streamText && (
                <div
                    style={{
                        background: C.surfaceHigh,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 12,
                        padding: 14,
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            color: C.purple,
                            fontWeight: 700,
                            marginBottom: 6,
                            fontFamily: "'Nunito Sans', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: C.purple,
                                animation: "pulse 1s ease-in-out infinite",
                            }}
                        />
                        ГЕНЕРАЦИЯ...
                    </div>
                    <pre
                        style={{
                            margin: 0,
                            fontSize: 11,
                            fontFamily: "monospace",
                            color: C.muted,
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            maxHeight: 120,
                            overflow: "hidden",
                        }}
                    >
                        {streamText.slice(-400)}
                    </pre>
                </div>
            )}

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

            {/* Result */}
            {result && (
                <div
                    style={{
                        background: C.purpleDim,
                        border: `1.5px solid ${C.purple}40`,
                        borderRadius: 16,
                        padding: "18px 20px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 14,
                            flexWrap: "wrap",
                            gap: 10,
                        }}
                    >
                        <div>
                            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16, color: C.purple }}>
                                ✦ Сгенерировано {result.length} вопросов
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontFamily: "'Nunito Sans', sans-serif" }}>
                                По теме: {topic}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Btn onClick={() => void generate()} loading={loading} variant="ghost" size="sm">
                                ↺ Заново
                            </Btn>
                            <Btn
                                onClick={() => { onImport(result); setResult(null); setTopic(""); }}
                                style={{
                                    background: C.purple,
                                    color: "#fff",
                                    borderRadius: 10,
                                    fontSize: 13,
                                    padding: "8px 16px",
                                }}
                            >
                                Добавить в тест →
                            </Btn>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {result.map((q, i) => (
                            <div
                                key={q.id}
                                style={{
                                    background: "#fff",
                                    borderRadius: 12,
                                    padding: "12px 16px",
                                    border: `1px solid ${C.purple}25`,
                                }}
                            >
                                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                                    <span
                                        style={{
                                            fontFamily: "'Nunito', sans-serif",
                                            fontWeight: 800,
                                            color: C.purple,
                                            flexShrink: 0,
                                            fontSize: 13,
                                        }}
                                    >
                                        {i + 1}.
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: C.text,
                                            fontFamily: "'Nunito Sans', sans-serif",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {q.text}
                                    </span>
                                </div>

                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 22 }}>
                                    {q.answers.map(a => (
                                        <span
                                            key={a.id}
                                            style={{
                                                fontSize: 11,
                                                padding: "3px 10px",
                                                borderRadius: 20,
                                                fontFamily: "'Nunito Sans', sans-serif",
                                                background: a.correct ? C.successDim : C.surfaceHigh,
                                                color: a.correct ? C.success : C.muted,
                                                fontWeight: a.correct ? 700 : 400,
                                                border: a.correct ? `1px solid ${C.success}50` : "none",
                                            }}
                                        >
                                            {a.correct ? "✓ " : ""}{a.text}
                                        </span>
                                    ))}
                                </div>

                                {q.explanation && (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            paddingLeft: 22,
                                            fontSize: 11,
                                            color: C.muted,
                                            fontFamily: "'Nunito Sans', sans-serif",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        💡 {q.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};