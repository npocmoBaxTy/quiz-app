import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetAttemptDetails } from "./hooks/useAttemptDetails"; // ВАШ ПУТЬ
import { LateBadge } from "@/shared/ui/LateBadge/LateBadge";
import { ArrowLeft, Check, Minus, X } from "lucide-react";
import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";
import type {
  AttemptAnswer,
  AttemptDetailsResponse,
  AttemptOption,
} from "@/features/getAttemptDetails/types/types";
import { ScoreStrip, type AnswerStatus } from "./components/ScoreStrip";
import "./AttemptDetailsPage.css";

const statusOf = (answer: AttemptAnswer): AnswerStatus =>
  answer.isSkipped ? "skipped" : answer.isCorrect ? "correct" : "wrong";

/** Цвет маргиналии и баллов — тот же язык, что у сегментов ленты. */
const ACCENT: Record<AnswerStatus, string> = {
  correct: "var(--success-green)",
  wrong: "var(--danger-red)",
  skipped: "var(--ad-skip)",
};

export const AttemptDetailsPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useGetAttemptDetails(attemptId);
  const details = data as AttemptDetailsResponse | undefined;
  const answers = useMemo(() => details?.answers ?? [], [details]);

  // Секции вопросов: нужны и для прыжка по ленте, и для подсветки текущего.
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const headerSentinel = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  // Активным считаем вопрос, пересекающий верхнюю треть экрана.
  useEffect(() => {
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number(entry.target.getAttribute("data-index")));
        if (visible.length) setActiveIndex(Math.min(...visible));
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [answers.length]);

  // Полоса прилипает, как только шапка уехала за верх экрана.
  useEffect(() => {
    const sentinel = headerSentinel.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPinned(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoading, isError]);

  const jumpTo = useCallback((index: number) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, []);

  const statuses = useMemo(() => answers.map(statusOf), [answers]);

  const tally = useMemo(
    () => ({
      correct: statuses.filter((s) => s === "correct").length,
      wrong: statuses.filter((s) => s === "wrong").length,
      skipped: statuses.filter((s) => s === "skipped").length,
    }),
    [statuses],
  );

  // Знаменатель показываем только если билет зафиксирован целиком —
  // у старых попыток maxPoints может отсутствовать.
  const maxScore = useMemo(() => {
    if (!answers.length || answers.some((a) => a.maxPoints === null)) return null;
    return answers.reduce((sum, a) => sum + (a.maxPoints ?? 0), 0);
  }, [answers]);

  if (isLoading)
    return (
      <div className="flex justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ad-rule)] border-t-[var(--main-blue)]" />
      </div>
    );

  if (isError || !details?.attempt)
    return (
      <div className="mx-auto max-w-md p-16 text-center">
        <p className="text-[var(--danger-red)]">
          {t("attemptDetails.loadError")}
        </p>
      </div>
    );

  const { attempt } = details;

  return (
    <div className="ad-root min-h-full bg-[var(--main-bg)]">
      {/* Прилипающая полоса: та же лента, только сжатая, плюс имя студента.
          Появляется, когда шапка ушла за верх экрана. */}
      {isPinned && (
        <div className="ad-bar fixed inset-x-0 top-0 z-30 border-b border-[var(--ad-rule)] bg-[var(--surface-main)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-2.5 md:px-6">
            <span className="hidden max-w-[14rem] shrink-0 truncate text-sm font-bold text-[var(--text-main)] sm:block">
              {attempt.full_name}
            </span>
            <div className="min-w-0 flex-1">
              <ScoreStrip
                statuses={statuses}
                activeIndex={activeIndex}
                onJump={jumpTo}
                size="sm"
              />
            </div>
            <span className="ad-display shrink-0 text-sm font-bold text-[var(--text-main)]">
              {attempt.score}
              {maxScore !== null && (
                <span className="text-[var(--text-muted)]">/{maxScore}</span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 pb-24 md:px-6">
        <button
          onClick={() => navigate(-1)}
          className="-ml-1 flex cursor-pointer items-center gap-2 py-6 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--main-blue)]"
        >
          <ArrowLeft size={16} />
          {t("attemptDetails.backToList")}
        </button>

        {/* --- ШАПКА: кто, сколько, и вся попытка одним взглядом --- */}
        <header className="rounded-2xl border border-[var(--ad-rule)] bg-[var(--surface-main)] p-6 md:p-8">
          <p className="ad-display text-[11px] font-bold tracking-[0.18em] text-[var(--text-muted)] uppercase">
            {t("attemptDetails.title")}
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-bold text-balance text-[var(--text-main)] md:text-3xl">
                {attempt.full_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--surface-high)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                  {attempt.status}
                </span>
                {attempt.isLate && (
                  <LateBadge overtimeSeconds={attempt.overtimeSeconds} />
                )}
              </div>
            </div>

            <div className="shrink-0">
              <div className="ad-display flex items-baseline gap-1.5">
                <span className="text-5xl leading-none font-extrabold text-[var(--text-main)] md:text-6xl">
                  {attempt.score}
                </span>
                {maxScore !== null && (
                  <span className="text-lg font-bold text-[var(--text-muted)]">
                    {t("attemptDetails.outOf", { max: maxScore })}
                  </span>
                )}
              </div>
              <p className="ad-display mt-1.5 text-[10px] font-bold tracking-[0.16em] text-[var(--text-muted)] uppercase">
                {t("attemptDetails.totalScore")}
              </p>
            </div>
          </div>

          {answers.length > 0 && (
            <div className="mt-7">
              <ScoreStrip
                statuses={statuses}
                activeIndex={activeIndex}
                onJump={jumpTo}
                animate
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                {(
                  [
                    ["correct", tally.correct, "countCorrect"],
                    ["wrong", tally.wrong, "countWrong"],
                    ["skipped", tally.skipped, "countSkipped"],
                  ] as const
                ).map(([status, count, labelKey]) => (
                  <span key={status} className="flex items-baseline gap-2">
                    <span
                      className="ad-display text-base font-bold"
                      style={{
                        color:
                          status === "skipped"
                            ? "var(--text-muted)"
                            : ACCENT[status],
                      }}
                    >
                      {count}
                    </span>
                    <span className="ad-display text-[10px] font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
                      {t(`attemptDetails.${labelKey}`)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </header>

        <div ref={headerSentinel} aria-hidden className="h-px" />

        {/* --- РАЗБОР ПО ВОПРОСАМ --- */}
        <div className="mt-10 space-y-10">
          {answers.map((ans: AttemptAnswer, index: number) => {
            const status = statusOf(ans);

            return (
              <section
                key={ans.questionId}
                data-index={index}
                ref={(node) => {
                  sectionRefs.current[index] = node;
                }}
                className="grid scroll-mt-24 grid-cols-[2rem_1fr] gap-x-4 md:grid-cols-[3.5rem_1fr] md:gap-x-6"
              >
                {/* Маргиналия: номер и вертикаль статуса — тот же цвет,
                    что у сегмента этого вопроса в ленте. */}
                <div className="flex flex-col items-center">
                  <span className="ad-display text-sm font-bold text-[var(--text-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="mt-2 w-[3px] flex-1 rounded-full"
                    style={{ backgroundColor: ACCENT[status] }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    {ans.questionText && (
                      <h2 className="text-lg leading-snug font-bold text-pretty text-[var(--text-main)] md:text-xl">
                        {ans.questionText}
                      </h2>
                    )}
                    <span
                      className="ad-display flex shrink-0 items-center gap-1.5 text-sm font-bold"
                      style={{
                        color:
                          status === "skipped"
                            ? "var(--text-muted)"
                            : ACCENT[status],
                      }}
                    >
                      {status === "correct" && <Check size={15} />}
                      {status === "wrong" && <X size={15} />}
                      {status === "skipped" && <Minus size={15} />}
                      <span className="sr-only">
                        {t(
                          `attemptDetails.${
                            status === "correct"
                              ? "correct"
                              : status === "wrong"
                                ? "incorrect"
                                : "skipped"
                          }`,
                        )}
                      </span>
                      {ans.maxPoints !== null
                        ? `${ans.points}/${ans.maxPoints}`
                        : ans.points}
                    </span>
                  </div>

                  {ans.questionImageUrl && (
                    <img
                      src={resolveMediaUrl(ans.questionImageUrl)}
                      alt=""
                      className="mt-4 max-h-72 w-auto rounded-xl border border-[var(--ad-rule)] object-contain"
                    />
                  )}

                  {/* ВАРИАНТЫ ОТВЕТОВ */}
                  {(ans.questionType === "single" ||
                    ans.questionType === "multiple") && (
                    <ul className="mt-4 space-y-1.5">
                      {ans.options?.map((opt: AttemptOption) => {
                        const picked = ans.selectedOptionIds.includes(opt.id);
                        const right = opt.isCorrect;

                        // Три содержательных случая; всё остальное — фон.
                        let rowStyle = "text-[var(--text-muted)]";
                        let rail = "transparent";
                        let badge: string | null = null;

                        if (picked && right) {
                          rowStyle =
                            "bg-[var(--success-green)]/8 font-semibold text-[var(--text-main)]";
                          rail = "var(--success-green)";
                          badge = t("attemptDetails.studentChoice");
                        } else if (picked && !right) {
                          rowStyle =
                            "bg-[var(--danger-red)]/8 font-semibold text-[var(--text-main)]";
                          rail = "var(--danger-red)";
                          badge = t("attemptDetails.studentMistake");
                        } else if (!picked && right) {
                          rowStyle = "text-[var(--text-main)]";
                          rail = "var(--success-green)";
                          badge = t("attemptDetails.correctAnswer");
                        }

                        return (
                          <li
                            key={opt.id}
                            className={`flex items-center justify-between gap-4 rounded-lg py-2.5 pr-3 pl-4 ${rowStyle}`}
                            style={{ boxShadow: `inset 3px 0 0 0 ${rail}` }}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              {opt.imageUrl && (
                                <img
                                  src={resolveMediaUrl(opt.imageUrl)}
                                  alt=""
                                  className="h-14 w-14 shrink-0 rounded-lg border border-[var(--ad-rule)] bg-[var(--surface-main)] object-contain"
                                />
                              )}
                              {opt.text && (
                                <span className="min-w-0">{opt.text}</span>
                              )}
                            </div>

                            {badge && (
                              <span
                                className="ad-display shrink-0 text-[10px] font-bold tracking-[0.1em] uppercase"
                                style={{ color: rail }}
                              >
                                {badge}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* ТЕКСТОВЫЙ ОТВЕТ */}
                  {ans.questionType === "text" && (
                    <div className="mt-4">
                      <p className="ad-display text-[10px] font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
                        {t("attemptDetails.studentAnswer")}
                      </p>
                      <div
                        className="mt-2 rounded-lg bg-[var(--surface-main)] py-3 pr-4 pl-4 text-[var(--text-main)]"
                        style={{
                          boxShadow: `inset 3px 0 0 0 ${ACCENT[status]}`,
                        }}
                      >
                        {ans.textAnswer ? (
                          <span className="whitespace-pre-wrap">
                            {ans.textAnswer}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">
                            {t("attemptDetails.noAnswerGiven")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {answers.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[var(--ad-rule)] p-12 text-center text-[var(--text-muted)]">
              {t("attemptDetails.noAnswers")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
