import i18n from "@/shared/config/i18n/i18n";

const DATE_LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

const currentLocale = () => DATE_LOCALES[i18n.language] ?? "ru-RU";

export const formatQuizDate = (
  isoString: string | null | undefined,
): string => {
  if (!isoString) return i18n.t("dateFormat.noDeadline");

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return i18n.t("dateFormat.invalidDate");

  return date.toLocaleString(currentLocale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Если нужно только время (например, 14:30)
export const formatTimeOnly = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString(currentLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Если нужна только короткая дата (20.04.2026)
export const formatShortDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString(currentLocale());
};
