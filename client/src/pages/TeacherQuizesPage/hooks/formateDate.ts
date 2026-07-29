export const formatQuizDate = (
  isoString: string | null | undefined,
): string => {
  if (!isoString) return "Без ограничений"; // Защита, если дедлайна нет

  const date = new Date(isoString);

  // Проверяем, валидная ли дата (на случай кривых данных)
  if (isNaN(date.getTime())) return "Неверная дата";

  // Форматируем под русскую локаль
  return date.toLocaleString("ru-RU", {
    day: "numeric", // 20
    month: "long", // апреля
    year: "numeric", // 2026
    hour: "2-digit", // 14
    minute: "2-digit", // 30
  });
};

// Если нужно только время (например, 14:30)
export const formatTimeOnly = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Если нужна только короткая дата (20.04.2026)
export const formatShortDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("ru-RU");
};
