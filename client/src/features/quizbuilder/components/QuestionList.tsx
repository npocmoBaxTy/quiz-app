import {
    DndContext,
    closestCenter,
    type DragEndEvent
} from "@dnd-kit/core"

import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"

import { type Question } from "../types"
import { QuestionCard } from "./QuestionCard"

interface Props {
    questions: Question[]
    onChange: (q: Question[]) => void
}

export function QuestionList({
    questions,
    onChange
}: Props) {
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        const oldIndex = questions.findIndex(
            q => q.id === active.id
        )

        const newIndex = questions.findIndex(
            q => q.id === over.id
        )

        onChange(arrayMove(questions, oldIndex, newIndex))
    }

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
            >
                {questions.map((q, i) => (
                    <QuestionCard
                        key={q.id}
                        q={q}
                        idx={i}
                        onChange={(updated) => {
                            const copy = [...questions]
                            copy[i] = updated
                            onChange(copy)
                        }}
                        onDelete={() =>
                            onChange(
                                questions.filter(x => x.id !== q.id)
                            )
                        }
                        onDuplicate={() => { }}
                    />
                ))}
            </SortableContext>
        </DndContext>
    )
}