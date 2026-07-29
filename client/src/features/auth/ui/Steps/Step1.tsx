import { Mail, OctagonAlert, User, Users } from "lucide-react";
import { FieldInput } from "../FieldInput";
import { useTranslation } from "react-i18next";
import { useFormCtx } from "../../FormContext/userFormContext";
import { z } from "zod";
import { Btn } from "../Button";
import { Roles } from "../Roles";
import toast from "react-hot-toast";
import { useState } from "react";
import { useGroups } from "../../hooks/useGroups";
import { C } from "../../constants";

const emailSchema = z.email();

export const StepOne = () => {
  const { t } = useTranslation();
  const { setName, setEmail, name, email, setStep, role, groupId, setGroupId } =
    useFormCtx();
  const { groups, isLoading: groupsLoading } = useGroups();

  // 1. Добавляем стейт, который запомнит, что пользователь нажал на кнопку
  const [wasSubmitted, setWasSubmitted] = useState(false);

  // 2. Определяем чистые правила валидации
  const isEmailValid = emailSchema.safeParse(email).success;
  const isNameValid = name.trim().length > 3;
  const isGroupValid = role === "teacher" || !!groupId;

  // 3. Решаем, когда показывать ошибку в UI:
  // Либо когда уже начали вводить (length > 0), либо когда уже нажали "Далее" (wasSubmitted)
  const showEmailError = (wasSubmitted || email.length > 0) && !isEmailValid;
  const showNameError = (wasSubmitted || name.length > 0) && !isNameValid;
  const showGroupError = wasSubmitted && role === "student" && !isGroupValid;

  function validateStep() {
    setWasSubmitted(true); // Форсируем отображение всех ошибок

    // Проверяем реальную валидность (теперь без инверсии, так проще читать)
    if (isEmailValid && isNameValid && isGroupValid) {
      setStep(2);
    } else {
      toast.error(t("auth.errors.fixFields"));
    }
  }

  return (
    <div className="step__one">
      <div className="mb-4">
        {/* Добавляем err и для имени, чтобы подсветить пустое поле */}
        <FieldInput
          err={showNameError}
          type="text"
          value={name}
          label={t("auth.labels.FIO")}
          placeholder={t("auth.labels.fioPlaceholder")}
          textChange={(e) => setName(e.target.value)}
        >
          <User
            size={15}
            className={showNameError ? "text-red-500" : "text-(--text-muted)"}
          />
        </FieldInput>
        {showNameError && (
          <div className="mt-1.5 ml-1 text-(--danger-red) flex items-center text-xs gap-1">
            <OctagonAlert size={14} />
            <span>{t("auth.errors.errName")}</span>
          </div>
        )}
      </div>

      <div>
        <FieldInput
          type="text"
          err={showEmailError}
          value={email}
          label="EMAIL"
          placeholder="you@university.edu"
          textChange={(e) => setEmail(e.target.value)}
        >
          <Mail
            size={15}
            className={showEmailError ? "text-red-500" : "text-(--text-muted)"}
          />
        </FieldInput>

        {showEmailError && (
          <div className="mt-1.5 ml-1 text-(--danger-red) flex items-center text-xs gap-1">
            <OctagonAlert size={14} />
            <span>{t("auth.errors.errEmail")}</span>
          </div>
        )}
      </div>

      <Roles />

      {role === "student" && (
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "block",
              marginBottom: 5,
              marginLeft: 5,
            }}
          >
            Группа
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: `1.5px solid ${!showGroupError ? C.border : C.danger}`,
              borderRadius: 11,
              background: C.surface,
              transition: "border-color .15s",
              overflow: "hidden",
            }}
            className="px-4"
          >
            <Users
              size={15}
              className={
                showGroupError ? "text-red-500" : "text-(--text-muted)"
              }
            />
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={groupsLoading}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                padding: "10px 11px",
                fontSize: 13,
                color: C.text,
                minWidth: 0,
              }}
            >
              <option value="" disabled>
                {groupsLoading ? "Загрузка групп..." : "Выберите группу"}
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          {showGroupError && (
            <div className="mt-1.5 ml-1 text-(--danger-red) flex items-center text-xs gap-1">
              <OctagonAlert size={14} />
              <span>{t("auth.errors.errGroup")}</span>
            </div>
          )}
        </div>
      )}

      <div className="mb-5">
        <Btn clickHandler={validateStep} />
      </div>
    </div>
  );
};
