import { useTranslation } from "react-i18next";
import { FieldInput } from "../FieldInput";
import { useFormCtx } from "../../FormContext/userFormContext";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { C } from "../../constants";
import { useRegisterUser } from "../../hooks/useRegister";
import { Spinner } from "@/shared/ui/SPinner/Spinner";
import toast from "react-hot-toast";
import axios from "axios";

type StrengthDetails = {
  label: string;
  color: string;
};
interface ICheck {
  label: string;
  ok: boolean;
}

export const Step2 = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    password,
    setPassword,
    rePassword,
    setRePassword,
    setStep,
    email,
    name,
    groupId,
    setEmail,
    setName,
    setRole,
    setGroupId,
  } = useFormCtx();

  const { register, error, isLoading } = useRegisterUser();

  const usePostMetaHandler = async () => {
    try {
      await register({ email, password, name, groupId });
      toast.success(t("auth.toastAccountCreated"));
      navigate("/dashboard");
    } catch (e) {
      // Проверяем, является ли ошибка ошибкой Axios
      if (axios.isAxiosError(e) && error == "user already exists") {
        toast.error(t("auth.errors.emailTakenBy", { email }));
      } else if (e instanceof Error) {
        // Обычная ошибка JS (например, обрыв сети)
        toast.error(error);
      } else {
        // На случай совсем странных вещей
        toast.error(t("auth.errors.unknownError"));
      }
      setStep(1);
      setEmail("");
      setPassword("");
      setName("");
      setGroupId("");
      setRole("student");
    }
  };

  // Уровни сложности (маппинг по score)
  const STRENGTH_LEVELS: Record<number, StrengthDetails> = {
    0: { label: t("auth.passwordStrength.empty"), color: "grey" },
    1: { label: t("auth.passwordStrength.weak"), color: "#EF4444" }, // danger
    2: { label: t("auth.passwordStrength.medium"), color: "#F59E0B" }, // amber
    3: { label: t("auth.passwordStrength.good"), color: "#3B82F6" }, // primary
    4: { label: t("auth.passwordStrength.strong"), color: "#10B981" }, // success
  };

  const pwStrength = (pw: string) => {
    if (!pw) return { score: 0, ...STRENGTH_LEVELS[0] };

    // Условия для подсчета баллов (score)
    const requirements = [
      pw.length >= 8,
      pw.length >= 12,
      /[A-ZА-Я]/.test(pw) && /[a-zа-я]/.test(pw),
      /\d/.test(pw),
      /[!@#$%^&*()]/.test(pw),
    ];

    const score = requirements.filter(Boolean).length;
    const normalizedScore = Math.min(score, 4);

    return {
      score,
      ...STRENGTH_LEVELS[normalizedScore],
    };
  };

  // А вот этот массив лучше вычислять прямо в компоненте для рендера списка
  const getPasswordChecks = (pw: string): ICheck[] => [
    { label: t("auth.labels.minPass"), ok: pw.length >= 8 },
    {
      label: t("auth.passwordChecks.upperLower"),
      ok: /[A-ZА-Я]/.test(pw) && /[a-zа-я]/.test(pw),
    },
    { label: t("auth.passwordChecks.digit"), ok: /\d/.test(pw) },
    { label: t("auth.passwordChecks.specialChar"), ok: /[!@#$%^&*()]/.test(pw) },
  ];

  const str = pwStrength(password);
  const checks = getPasswordChecks(password);

  return (
    <div className="step__two-wrapper relative">
      <div className="password__inner">
        <FieldInput
          label={t("auth.labels.password")}
          type={"password"}
          value={password}
          pass={true}
          textChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.labels.minPass")}
        >
          <Lock size={15} />
        </FieldInput>
        <div className="psw--wrapper">
          {password && (
            <div style={{ marginTop: 7 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 99,
                      background: i <= str.score ? str.color : C.border,
                      transition: "background .25s",
                    }}
                  />
                ))}
              </div>
              {str.label && (
                <span
                  style={{
                    fontSize: 11,
                    color: str.color,
                    fontWeight: 600,
                    transition: "color .25s",
                  }}
                >
                  {str.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="password__strenght--indicator pl-1 mt-2">
        <div
          style={{
            background: C.surfaceHigh,
            border: `1.5px solid ${C.border}`,
            borderRadius: 10,
            padding: "11px 13px",
            marginTop: 6,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 7,
            }}
          >
            {t("auth.requirementsTitle")}
          </div>
          {checks.map(({ label, ok }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  background: ok ? C.success : C.border,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background .2s",
                }}
              >
                {ok && (
                  <svg width={7} height={6} viewBox="0 0 8 6" fill="none">
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="#fff"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: ok ? C.success : C.muted,
                  transition: "color .2s",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <FieldInput
          label={t("auth.labels.confirmPass")}
          type={"password"}
          value={rePassword}
          pass={true}
          textChange={(e) => setRePassword(e.target.value)}
          placeholder={t("auth.labels.confirmPassLabel")}
        >
          <Lock size={15} />
        </FieldInput>
      </div>
      <div style={{ display: "flex", gap: 9 }} className="my-3">
        <button
          type="button"
          onClick={() => {
            setStep(1);
          }}
          style={{
            flexShrink: 0,
            padding: "12px 18px",
            background: C.surfaceHigh,
            border: `1.5px solid ${C.border}`,
            borderRadius: 11,
            fontWeight: 700,
            fontSize: 13,
            color: C.muted,
            cursor: "pointer",
          }}
        >
          ← {t("auth.register.btnBck")}
        </button>
        <button
          disabled={isLoading ? true : false}
          onClick={usePostMetaHandler}
          className={`${isLoading ? "bg-(--text-muted)" : "bg-(--main-blue)"} w-full rounded-xl text-white text-xs cursor-pointer disabled:cursor-not-allowed`}
        >
          {isLoading ? <Spinner /> : t("auth.register.title")}
        </button>
      </div>
    </div>
  );
};
