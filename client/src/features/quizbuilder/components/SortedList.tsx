import React, { useState } from "react";
import type { ReactNode } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import type {
    DragStartEvent,
    DragEndEvent,
    UniqueIdentifier,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import type { Question } from "../types";
import { C } from "../constants";
import { QuestionCard } from "./QuestionCard";

// ── Drag-hint banner ──────────────────────────────────────────────────────────

const DragHint: React.FC = () => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
            padding: "10px 14px",
            background: C.primaryDim,
            border: `1px solid ${C.primaryMid}`,
            borderRadius: 12,
        }}
    >
        <svg width={14} height={18} viewBox="0 0 14 18" fill={C.primary}>
            <circle cx={4} cy={4} r={1.8} />
            <circle cx={10} cy={4} r={1.8} />
            <circle cx={4} cy={9} r={1.8} />
            <circle cx={10} cy={9} r={1.8} />
            <circle cx={4} cy={14} r={1.8} />
            <circle cx={10} cy={14} r={1.8} />
        </svg>
        <span
            style={{
                fontSize: 12,
                color: C.primary,
                fontFamily: "'Nunito Sans', sans-serif",
                fontWeight: 600,
            }}
        >
            Перетащите вопросы за иконку
        </span>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Nunito Sans', sans-serif" }}>
            — чтобы изменить порядок
        </span>
    </div>
);

// ── Props ─────────────────────────────────────────────────────────────────────

interface SortableListProps {
    questions: Question[];
    onReorder: (next: Question[]) => void;
    onUpdate: (id: string, updated: Question) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    footer?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const SortableList: React.FC<SortableListProps> = ({
    questions,
    onReorder,
    onUpdate,
    onDelete,
    onDuplicate,
    footer,
}) => {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    // Require 8 px movement before drag starts so clicks still work
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveId(active.id);
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setActiveId(null);
        if (!over || active.id === over.id) return;
        const oldIdx = questions.findIndex(q => q.id === active.id);
        const newIdx = questions.findIndex(q => q.id === over.id);
        if (oldIdx === -1 || newIdx === -1) return;
        onReorder(arrayMove(questions, oldIdx, newIdx));
    };

    const activeQ = activeId !== null
        ? questions.find(q => q.id === activeId)
        : undefined;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
            >
                <DragHint />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {questions.map((q, idx) => (
                        <div key={q.id} className="q-anim">
                            <QuestionCard
                                q={q}
                                idx={idx}
                                onChange={updated => onUpdate(q.id, updated)}
                                onDelete={() => onDelete(q.id)}
                                onDuplicate={() => onDuplicate(q.id)}
                            />
                        </div>
                    ))}
                </div>

                {footer && <div style={{ marginTop: 10 }}>{footer}</div>}
            </SortableContext>

            {/* Ghost card shown while dragging */}
            <DragOverlay
                dropAnimation={{
                    duration: 200,
                    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}
            >
                {activeQ && (
                    <div className="dnd-overlay" style={{ transform: "rotate(1.5deg)", opacity: 0.9 }}>
                        <QuestionCard
                            q={activeQ}
                            idx={questions.findIndex(q => q.id === activeQ.id)}
                            onChange={() => { }}
                            onDelete={() => { }}
                            onDuplicate={() => { }}
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
};