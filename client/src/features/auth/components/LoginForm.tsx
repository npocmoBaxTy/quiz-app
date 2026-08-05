import { useTranslation } from "react-i18next";
import { C } from "../constants";
import { FieldInput } from "../ui/FieldInput";
import { Lock, Mail } from "lucide-react";
import { Divider } from "../ui/Divider";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader } from "@/widgets/Loader/Loader";
import { useAuthCtx } from "@/app/providers/auth/useAuthContext";
import { loginRequest } from "../hooks/useLogin";
import { Spinner } from "@/shared/ui/SPinner/Spinner";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuthStore } from "../store/authstore";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuthCtx();
  const { user, login } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      if (user.role === "TEACHER") {
        navigate("/teacher/quizes", { replace: true });
      } else {
        navigate("/student/quizes", { replace: true });
      }
    }
  }, [user, navigate]);

  // внутри LoginForm
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  //Log-in User
  const onSubmit = async () => {
    try {
      setIsSubmitting(true);

      const res = await loginRequest({ email, password });

      login(res.user);

    } catch (err: unknown) {
      let msg = t("auth.errors.loginError");

      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.error || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#131419]">
        <Loader />
      </div>
    );

  return (
    <div className="login__form-wrapper flex items-center justify-center h-screen">
      <div className="login__form-inner w-120 bg-white rounded-xl px-4 py-6">
        <div className="inner__title mb-5">
          <div
            style={{
              fontWeight: 800,
              fontSize: 21,
              color: C.text,
              marginBottom: 5,
            }}
          >
            {t("auth.authorization.title")}
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {t("auth.authorization.subtitle")}
          </div>
        </div>
        <div className="inner-form__inputs mb-5">
          <div className="mb-5">
            <FieldInput
              type="text"
              placeholder="user@example.com"
              label="Email"
              textChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            >
              <Mail size={15} />
            </FieldInput>
          </div>
          <FieldInput
            placeholder="*******"
            type="password"
            label={t("auth.labels.password")}
            pass={true}
            textChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          >
            <Lock size={15} />
          </FieldInput>
        </div>
        <div className="mb-5">
          <button
            type={"button"}
            className={`
                ${isSubmitting ? "bg-(--text-muted) cursor-not-allowed" : "bg-(--main-blue) cursor-pointer"}
                `}
            disabled={isSubmitting ? true : false}
            style={{
              width: "100%",
              padding: "12px",
              color: "#fff",
              border: "none",
              borderRadius: 11,
              fontWeight: 800,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 2,
            }}
            onClick={onSubmit}
          >
            {isSubmitting ? <Spinner /> : t("auth.login")}
          </button>
        </div>
        <Divider label={t("auth.noAccountYet")} />
        <div className="inner__footer text-center">
          <NavLink
            to={"/user/register"}
            className={"text-sm text-(--main-blue) mt-2"}
          >
            {t("auth.register.title")}
          </NavLink>
        </div>
      </div>
    </div>
  );
};
