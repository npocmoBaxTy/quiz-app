import React, { useState } from "react";
import type { TabKey, TabDef, QuizMeta, Question } from "./types";
import {
  C,
  GLOBAL_CSS,
  CATEGORIES,
  ATTEMPTS_OPTIONS,
  makeDefaultMeta,
  makeQuestion,
} from "./constants";
import { Badge } from "./components/ui";
import { Btn } from "./components/Btn";
import { Field } from "./components/ui";
import { TextInput } from "./components/ui";
import { ManualTab } from "./components/ManualTab";
import { ImportTab } from "./components/ImportTab";
import { AITab } from "./components/AITab";

// ── MetaCard ──────────────────────────────────────────────────────────────────

interface MetaCardProps {
  meta: QuizMeta;
  onChange: (meta: QuizMeta) => void;
}

const selectStyle: React.CSSProperties = {
  fontFamily: "'Nunito Sans', sans-serif",
  fontSize: 13,
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  padding: "9px 12px",
  background: C.surface,
  color: C.text,
  outline: "none",
  cursor: "pointer",
};

const numInputStyle: React.CSSProperties = {
  fontFamily: "'Nunito Sans', sans-serif",
  fontSize: 13,
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  padding: "9px 12px",
  background: C.surface,
  color: C.text,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const MetaCard: React.FC<MetaCardProps> = ({ meta, onChange }) => (
  <div
    style={{
      background: C.surface,
      border: `1.5px solid ${C.border}`,
      borderRadius: 20,
      padding: "22px 24px",
      marginBottom: 20,
      minHeight: "100vh"
    }}
  >
    <div
      style={{
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 800,
        fontSize: 15,
        color: C.text,
        marginBottom: 16,
      }}
    >
      Настройки теста
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 14,
        marginBottom: 14,
      }}
    >
      <Field label="Название теста">
        <TextInput
          value={meta.title}
          onChange={(v) => onChange({ ...meta, title: v })}
          placeholder="Напр: JavaScript — Основы языка, Контрольная №3..."
        />
      </Field>

      <Field label="Категория">
        <select
          value={meta.category}
          onChange={(e) => onChange({ ...meta, category: e.target.value })}
          style={{ ...selectStyle, color: meta.category ? C.text : C.muted }}
        >
          <option value="">— выберите —</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: 14,
        alignItems: "end",
      }}
    >
      <Field label="Лимит времени (мин)">
        <input
          type="number"
          min={1}
          placeholder="Без лимита"
          value={meta.time}
          onChange={(e) => onChange({ ...meta, time: e.target.value })}
          style={numInputStyle}
        />
      </Field>

      <Field label="Проходной балл (%)">
        <input
          type="number"
          min={0}
          max={100}
          value={meta.passing}
          onChange={(e) =>
            onChange({ ...meta, passing: Number(e.target.value) })
          }
          style={numInputStyle}
        />
      </Field>

      <Field label="Попыток">
        <select
          value={meta.attempts}
          onChange={(e) => onChange({ ...meta, attempts: e.target.value })}
          style={selectStyle}
        >
          {ATTEMPTS_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field label="Параметры">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            height: 38,
            paddingLeft: 4,
          }}
        >
          <input
            type="checkbox"
            checked={meta.shuffle}
            onChange={(e) => onChange({ ...meta, shuffle: e.target.checked })}
            style={{
              width: 16,
              height: 16,
              accentColor: C.primary,
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: 13, color: C.text, whiteSpace: "nowrap" }}>
            Перемешать
          </span>
        </label>
      </Field>
    </div>
  </div>
);

// ── TopBar ────────────────────────────────────────────────────────────────────

interface TopBarProps {
  validCount: number;
  totalCount: number;
  saved: boolean;
  onSave: () => void;
  onPublish: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  validCount,
  totalCount,
  saved,
  onSave,
  onPublish,
}) => (
  <div
    style={{
      background: C.surface,
      borderBottom: `1.5px solid ${C.border}`,
      padding: "0 28px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}
  >
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 60,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: C.muted, cursor: "pointer" }}>
          Тесты
        </span>
        <span style={{ color: C.border }}>›</span>
        <span style={{ fontSize: 12, color: C.primary, fontWeight: 600 }}>
          Новый тест
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Badge color={validCount === totalCount ? "success" : "amber"}>
          {validCount}/{totalCount} вопросов готово
        </Badge>
        {saved && <Badge color="success">✓ Сохранено!</Badge>}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 8,
          paddingLeft: 16,
          borderLeft: `1.5px solid ${C.border}`,
        }}
      >
        <Btn variant="ghost" size="sm">
          Предпросмотр
        </Btn>
        <Btn variant="outline" size="sm" onClick={onSave}>
          Сохранить черновик
        </Btn>
        <Btn
          size="sm"
          onClick={onPublish}
          style={{
            background: validCount > 0 ? C.success : C.muted,
            color: "#fff",
          }}
        >
          Опубликовать
        </Btn>
      </div>
    </div>
  </div>
);

// ── Tabs ──────────────────────────────────────────────────────────────────────

interface TabBarProps {
  tabs: TabDef[];
  active: TabKey;
  onSelect: (key: TabKey) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, active, onSelect }) => (
  <div
    style={{
      display: "flex",
      borderBottom: `1.5px solid ${C.border}`,
      background: C.surfaceHigh,
      padding: "0 6px",
    }}
  >
    {tabs.map(({ key, label, count }) => (
      <button
        key={key}
        onClick={() => onSelect(key)}
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 13.5,
          padding: "14px 20px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: active === key ? C.primary : C.muted,
          borderBottom: `2.5px solid ${active === key ? C.primary : "transparent"}`,
          marginBottom: -1.5,
          transition: "all .15s",
          display: "flex",
          alignItems: "center",
          gap: 7,
          whiteSpace: "nowrap",
        }}
      >
        {label}
        {count !== undefined && (
          <span
            style={{
              background: active === key ? C.primaryDim : C.border,
              color: active === key ? C.primary : C.muted,
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 20,
              fontWeight: 700,
              transition: "all .15s",
            }}
          >
            {count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ── QuizCreatorPage ───────────────────────────────────────────────────────────

export const QuizCreator: React.FC = () => {
  const [meta, setMeta] = useState<QuizMeta>(makeDefaultMeta());
  const [questions, setQuestions] = useState<Question[]>([makeQuestion()]);
  const [tab, setTab] = useState<TabKey>("manual");
  const [saved, setSaved] = useState(false);

  const validCount = questions.filter(
    (q) =>
      q.text.trim() !== "" &&
      q.answers.some((a) => a.correct) &&
      q.answers.every((a) => a.text.trim() !== ""),
  ).length;

  const totalPts = questions.reduce((s, q) => s + q.points, 0);

  const handleSave = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleImport = (imported: Question[]): void => {
    setQuestions((prev) => [
      ...prev.filter((q) => q.text.trim() !== ""),
      ...imported,
    ]);
    setTab("manual");
  };

  const TABS: TabDef[] = [
    { key: "manual", label: "✏ Вручную", count: questions.length },
    { key: "import", label: "📂 Импорт" },
    { key: "ai", label: "✦ ИИ-генерация" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{GLOBAL_CSS}</style>

      <TopBar
        validCount={validCount}
        totalCount={questions.length}
        saved={saved}
        onSave={handleSave}
        onPublish={handleSave}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 28px" }}>
        <MetaCard meta={meta} onChange={setMeta} />

        {/* Tabs container */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <TabBar tabs={TABS} active={tab} onSelect={setTab} />

          <div style={{ padding: "22px 24px" }}>
            {tab === "manual" && (
              <ManualTab questions={questions} onChange={setQuestions} />
            )}
            {tab === "import" && <ImportTab onImport={handleImport} />}
            {tab === "ai" && <AITab onImport={handleImport} />}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: C.muted,
              fontFamily: "'Nunito Sans', sans-serif",
            }}
          >
            Готово: {validCount} из {questions.length} вопросов · {totalPts}{" "}
            баллов всего
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setQuestions([makeQuestion()])}>
              Очистить всё
            </Btn>
            <Btn variant="outline" onClick={handleSave}>
              Сохранить черновик
            </Btn>
            <Btn
              onClick={handleSave}
              style={{ background: C.success, color: "#fff" }}
            >
              Опубликовать тест
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};
