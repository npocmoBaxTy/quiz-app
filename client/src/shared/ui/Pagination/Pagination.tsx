import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  // Если страница всего одна (или ноль), прячем пагинацию
  if (totalPages <= 1) return null;

  // Генерируем массив номеров страниц
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Кнопка "Назад" */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Номера страниц */}
      <div className="flex items-center gap-1">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Кнопка "Вперед" */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
