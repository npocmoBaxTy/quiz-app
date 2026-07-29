import { useState } from "react";
import { useGenerateQuestions, type GeneratedQuestion } from "./hooks/useAIQueries";
import { Sparkles, CheckCircle2, Circle, Loader2, RotateCcw } from "lucide-react";

interface AiGeneratorProps {
  // Передает выбранные вопросы в родительский компонент
  onAddQuestions: (questions: GeneratedQuestion[]) => void; 
}

export const AiQuestionGenerator = ({ onAddQuestions }: AiGeneratorProps) => {
  // Настройки запроса
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Средний");
  const [count, setCount] = useState(3);

  // Результаты
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const { mutate: generate, isPending, isError } = useGenerateQuestions();

  const handleGenerate = () => {
    if (!topic.trim()) return;
    
    generate({ topic, difficulty, count }, {
      onSuccess: (data) => {
        setGeneratedQuestions(data);
        setSelectedIndices(new Set(data.map((_, i) => i))); // По умолчанию выбираем все
      }
    });
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) newSelected.delete(index);
    else newSelected.add(index);
    setSelectedIndices(newSelected);
  };

  const handleAddSelected = () => {
    const questionsToAdd = generatedQuestions.filter((_, i) => selectedIndices.has(i));
    onAddQuestions(questionsToAdd);
    
    // Очищаем форму, чтобы при следующем открытии таба она была пустой
    setGeneratedQuestions([]);
    setTopic("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-indigo-600" size={20} />
          Создание вопросов с Gemini ИИ
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Укажите тему, и нейросеть сама придумает вопросы и варианты ответов.
        </p>
      </div>

      {/* ФОРМА (Показывается, пока нет сгенерированных вопросов) */}
      {generatedQuestions.length === 0 ? (
        <div className="space-y-5 max-w-3xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Тема вопросов</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Например: Основы React, хуки useEffect и useState"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Сложность</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              >
                <option value="Базовый">Базовый (Для новичков)</option>
                <option value="Средний">Средний (Стандарт)</option>
                <option value="Продвинутый">Продвинутый (С подвохом)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Количество (макс. 10)</label>
              <input 
                type="number" 
                min="1" max="10"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {isError && <p className="text-red-500 text-sm">Ошибка при обращении к ИИ. Проверьте настройки бэкенда.</p>}

          <button 
            type="button"
            onClick={handleGenerate}
            disabled={isPending || !topic.trim()}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isPending ? "Gemini генерирует..." : "Создать вопросы"}
          </button>
        </div>
      ) : (
        /* СПИСОК РЕЗУЛЬТАТОВ */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <span className="text-sm font-medium text-indigo-800">
              Сгенерировано {generatedQuestions.length} вопросов. Отметьте подходящие.
            </span>
            <button 
            type="button"
              onClick={() => setGeneratedQuestions([])} 
              className="text-sm flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              <RotateCcw size={16} /> Сбросить и начать заново
            </button>
          </div>
          
          <div className="grid gap-4">
            {generatedQuestions.map((q, idx) => {
              const isSelected = selectedIndices.has(idx);
              return (
                <div 
                  key={idx} 
                  onClick={() => toggleSelection(idx)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? <CheckCircle2 className="text-indigo-600" size={24} /> : <Circle className="text-slate-300" size={24} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-[15px] mb-4 leading-snug">{q.text}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx} 
                            className={`text-sm px-3 py-2.5 rounded-lg border ${
                              opt.isCorrect 
                                ? 'bg-green-50 border-green-200 text-green-800 font-medium' 
                                : 'bg-slate-50 border-transparent text-slate-600'
                            }`}
                          >
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="button"
              onClick={handleAddSelected}
              disabled={selectedIndices.size === 0}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              Добавить в тест ({selectedIndices.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};