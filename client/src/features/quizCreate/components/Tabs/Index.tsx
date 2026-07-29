import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { ManualTab } from "./ManualTab";
import { Folder, Pen, Sparkles } from "lucide-react";
import { C } from "@/features/auth/constants";
import { ImportTab } from "./ImportTab";
import { useState } from "react";
import { AiQuestionGenerator } from "@/features/AI";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { GeneratedQuestion } from "@/features/AI/hooks/useAIQueries";



export function QuizTabs() {
  const { control } = useFormContext(); 
  
  // Подключаемся к массиву вопросов в нашей форме
  const { replace } = useFieldArray({
    control,
    name: "questions", // Имя поля в вашей форме, где лежат вопросы
  });

  // 🔥 НОВАЯ ФУНКЦИЯ 🔥
  const handleAddAiQuestions = (newQuestions: GeneratedQuestion[]) => {
    setActiveTab("manual");
    

    const formattedQuestions = newQuestions.map((q) => ({
    text: q.text, 
    type: q.type,
    points: q.points || 1, // на всякий случай задаем дефолтный балл
    
    // 🔥 ВОТ ЗДЕСЬ ИЗМЕНЕНИЕ: 
    // Мы берем q.options от ИИ, но записываем их в ключ answers для вашей формы!
    answers: q.options.map((opt) => ({
      text: opt.text, 
      isCorrect: opt.isCorrect 
    }))
  }));

    // 2. Добавляем сгенерированные вопросы в локальный стейт RHF
    replace(formattedQuestions); 
    
    // Теперь они появились в списке, но в БД еще не улетели!
  };
  const [activeTab, setActiveTab] = useState("manual");
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full bg-transparent"
    >
      <TabsList
        className="w-full bg-transparent"
        style={{ background: C.surfaceHigh }}
      >
        <TabsTrigger
          value="manual"
          className="rounded-none aria-selected:text-(--main-blue) aria-selected:bg-transparent aria-selected:border-b"
        >
          <Pen size={14} />
          Вручную
        </TabsTrigger>
        <TabsTrigger
          className="rounded-none aria-selected:text-(--main-blue) aria-selected:bg-transparent aria-selected:border-b"
          value="import"
        >
          <Folder size={14} />
          Импорт
        </TabsTrigger>
        <TabsTrigger
          className="rounded-none aria-selected:text-(--main-blue) aria-selected:bg-transparent aria-selected:border-b"
          value="ai"
        >
          <Sparkles size={14} />
          Генерация ИИ
        </TabsTrigger>
      </TabsList>
      <TabsContent value="manual" className="bg-white w-full">
        <ManualTab />
      </TabsContent>
      <TabsContent value="import">
        <ImportTab
          changeTab={() => {
            setActiveTab("manual");
          }}
        />
      </TabsContent>
      <TabsContent value="ai">
        <AiQuestionGenerator onAddQuestions={handleAddAiQuestions} />
      </TabsContent>
    </Tabs>
  );
}
