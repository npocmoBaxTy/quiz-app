// Запас на сеть и на задержку автосабмита по таймеру: сдачу в пределах
// этого окна после дедлайна просрочкой не считаем.
const LATE_GRACE_MS = 60 * 1000;

type TimingInput = {
  startedAt: Date | null;
  finishedAt: Date | null;
  timeLimit: number | null; // минуты, как в quizzes.time_limit
};

export type AttemptTiming = {
  isLate: boolean;
  /** На сколько секунд просрочена сдача (0, если в срок или лимита нет) */
  overtimeSeconds: number;
};

/**
 * Просрочка считается на чтение — по started_at, finished_at и лимиту теста.
 * Отдельного поля в БД нет, поэтому показатель одинаково корректен
 * и для новых попыток, и для всех уже существующих.
 */
export function getAttemptTiming({
  startedAt,
  finishedAt,
  timeLimit,
}: TimingInput): AttemptTiming {
  if (!startedAt || !finishedAt || !timeLimit || timeLimit <= 0) {
    return { isLate: false, overtimeSeconds: 0 };
  }

  const deadline = startedAt.getTime() + timeLimit * 60 * 1000;
  const overtimeMs = finishedAt.getTime() - deadline;

  if (overtimeMs <= LATE_GRACE_MS) {
    return { isLate: false, overtimeSeconds: 0 };
  }

  return { isLate: true, overtimeSeconds: Math.round(overtimeMs / 1000) };
}
