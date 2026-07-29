import React from "react";
import { C } from "../constants";
import { useSortable } from "@dnd-kit/sortable";

// The handle renders the 6-dot grip icon and exposes the
// drag-listener props that @dnd-kit/sortable provides.

interface DragHandleProps {
    listeners: ReturnType<typeof useSortable>["listeners"];
    attributes: ReturnType<typeof useSortable>["attributes"];
}

export const DragHandle: React.FC<DragHandleProps> = ({ listeners, attributes }) => (
    <div
        {...listeners}
        {...attributes}
        title="Перетащить"
        style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 7,
            color: C.muted,
            flexShrink: 0,
            cursor: "grab",
            touchAction: "none",
            transition: "background .15s, color .15s",
        }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.background = C.primaryDim;
            (e.currentTarget as HTMLDivElement).style.color = C.primary;
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
            (e.currentTarget as HTMLDivElement).style.color = C.muted;
        }}
    >
        <svg width={14} height={18} viewBox="0 0 14 18" fill="currentColor">
            <circle cx={4} cy={4} r={1.8} />
            <circle cx={10} cy={4} r={1.8} />
            <circle cx={4} cy={9} r={1.8} />
            <circle cx={10} cy={9} r={1.8} />
            <circle cx={4} cy={14} r={1.8} />
            <circle cx={10} cy={14} r={1.8} />
        </svg>
    </div>
);