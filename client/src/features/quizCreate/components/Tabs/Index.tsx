import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { ManualTab } from "./ManualTab";
import { Folder, Pen } from "lucide-react";
import { C } from "@/features/auth/constants";
import { ImportTab } from "./ImportTab";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Таб генерации вопросов через ИИ временно убран из билдера.
// Сам генератор (@/features/AI) и роут /api/ai/generate-questions на месте —
// чтобы вернуть, достаточно восстановить триггер и TabsContent со значением "ai".

export function QuizTabs() {
  const { t } = useTranslation();

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
          {t("quizBuilder.tabs.manual")}
        </TabsTrigger>
        <TabsTrigger
          className="rounded-none aria-selected:text-(--main-blue) aria-selected:bg-transparent aria-selected:border-b"
          value="import"
        >
          <Folder size={14} />
          {t("quizBuilder.tabs.import")}
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
    </Tabs>
  );
}
