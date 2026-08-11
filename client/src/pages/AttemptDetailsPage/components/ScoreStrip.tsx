import { useTranslation } from "react-i18next";

/** Итог по одному вопросу — то, что кодирует сегмент ленты. */
export type AnswerStatus = "correct" | "wrong" | "skipped";

const SEGMENT_COLOR: Record<AnswerStatus, string> = {
  correct: "var(--success-green)",
  wrong: "var(--danger-red)",
  skipped: "var(--ad-skip)",
};

interface ScoreStripProps {
  statuses: AnswerStatus[];
  /** Вопрос, который сейчас в фокусе чтения; -1 — ни один */
  activeIndex: number;
  onJump: (index: number) => void;
  /** lg — в шапке, sm — в прилипающей полосе */
  size?: "lg" | "sm";
  animate?: boolean;
}

/**
 * Лента результата: по сегменту на вопрос в порядке билета.
 * Одновременно обзор всей попытки и навигация по ней.
 */
export const ScoreStrip = ({
  statuses,
  activeIndex,
  onJump,
  size = "lg",
  animate = false,
}: ScoreStripProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-end ${size === "lg" ? "h-8 gap-[3px]" : "h-3.5 gap-[2px]"}`}
    >
      {statuses.map((status, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onJump(index)}
            title={t("attemptDetails.jumpToQuestion", { number: index + 1 })}
            aria-label={t("attemptDetails.jumpToQuestion", {
              number: index + 1,
            })}
            style={{
              backgroundColor: SEGMENT_COLOR[status],
              animationDelay: animate ? `${Math.min(index, 24) * 22}ms` : undefined,
            }}
            className={`h-full min-w-[6px] flex-1 cursor-pointer rounded-[2px] transition-[outline-color,opacity] outline-2 outline-offset-2 hover:opacity-80 focus-visible:outline-[var(--main-blue)] ${
              isActive ? "outline-[var(--main-blue)]" : "outline-transparent"
            } ${animate ? "ad-seg-animated" : ""}`}
          />
        );
      })}
    </div>
  );
};
