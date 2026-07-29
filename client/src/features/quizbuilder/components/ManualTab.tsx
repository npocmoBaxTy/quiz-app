import React from "react";
import type { Question } from "../types";
import { C, makeQuestion, uid } from "../constants";
import { SortableList } from "./SortedList";

interface ManualTabProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
}

export const ManualTab: React.FC<ManualTabProps> = ({ questions, onChange }) => {
    const updateQ = (id: string, updated: Question): void =>
        onChange(questions.map(q => (q.id === id ? updated : q)));

    const deleteQ = (id: string): void => {
        if (questions.length <= 1) return;
        onChange(questions.filter(q => q.id !== id));
    };

    const duplicateQ = (id: string): void => {
        const idx = questions.findIndex(q => q.id === id);
        if (idx === -1) return;
        const src = questions[idx];
        const copy: Question = {
            ...src,
            id: uid(),
            answers: src.answers.map(a => ({ ...a, id: uid() })),
        };
        const next = [...questions];
        next.splice(idx + 1, 0, copy);
        onChange(next);
    };

    const addQuestion = (): void => onChange([...questions, makeQuestion()]);

    const footer = (
        <button
            onClick={addQuestion}
            style={{
                background: "none",
                border: `2px dashed ${C.primaryMid}`,
                borderRadius: 16,
                padding: "14px",
                cursor: "pointer",
                color: C.primary,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                transition: "background .15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = C.primaryDim)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
        >
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
            Добавить вопрос
        </button>
    );

    return (
        <SortableList
            questions={questions}
            onReorder={onChange}
            onUpdate={updateQ}
            onDelete={deleteQ}
            onDuplicate={duplicateQ}
            footer={footer}
        />
    );
};