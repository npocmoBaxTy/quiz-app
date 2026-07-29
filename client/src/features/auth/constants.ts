import type {
  LoginFormData, RegisterFormData, FormErrors,
  PasswordStrength, RoleOption, DemoAccount,
} from "./types";

// ─── Chalk palette ────────────────────────────────────────────────────────────

export const C = {
  bg:          "#f5f4f0",
  surface:     "#ffffff",
  surfaceHigh: "#f0eeea",
  border:      "#e5e2db",
  text:        "#1c1a17",
  muted:       "#8a8479",
  primary:     "#5b6af5",
  primaryDim:  "#eef0fe",
  primaryMid:  "#c8cdfa",
  success:     "#27ae74",
  successDim:  "#e8f8f0",
  danger:      "#e05252",
  dangerDim:   "#fef0f0",
  amber:       "#f5a623",
} as const;

// ─── Font families ────────────────────────────────────────────────────────────

export const F = {
  heading: "'Nunito', sans-serif",
  body:    "'Nunito Sans', sans-serif",
} as const;

// ─── Global CSS ───────────────────────────────────────────────────────────────

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
  input:focus, select:focus { outline: none; }
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 40px #fff inset !important;
    -webkit-text-fill-color: #1c1a17 !important;
  }
`;

// ─── Static data ──────────────────────────────────────────────────────────────

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "student",
    label: "Студент",
    desc:  "Прохожу тесты и слежу за результатами",
  },
  {
    value: "teacher",
    label: "Преподаватель",
    desc:  "Создаю тесты и оцениваю студентов",
  },
];

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: "Студент",       email: "student@quiz.com", password: "Student123" },
  { label: "Преподаватель", email: "teacher@quiz.com", password: "Teacher123" },
  { label: "Администратор", email: "admin@quiz.com",   password: "Admin1234"  },
];

export const PASSWORD_REQUIREMENTS = [
  { label: "Минимум 8 символов", test: (pw: string) => pw.length >= 8 },
  { label: "Заглавная буква",    test: (pw: string) => /[A-ZА-Я]/.test(pw) },
  { label: "Строчная буква",     test: (pw: string) => /[a-zа-я]/.test(pw) },
  { label: "Цифра",              test: (pw: string) => /\d/.test(pw) },
] as const;

// ─── Validators ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(form: LoginFormData): FormErrors<LoginFormData> {
  const e: FormErrors<LoginFormData> = {};
  if (!form.email.trim())              e.email    = "Введите email";
  else if (!EMAIL_RE.test(form.email)) e.email    = "Некорректный email";
  if (!form.password)                  e.password = "Введите пароль";
  return e;
}

export function validateRegisterStep1(
  form: RegisterFormData,
): FormErrors<RegisterFormData> {
  const e: FormErrors<RegisterFormData> = {};
  if (!form.fullName.trim())
    e.fullName = "Введите ФИО";
  else if (form.fullName.trim().split(" ").length < 2)
    e.fullName = "Укажите имя и фамилию";
  if (!form.email.trim())              e.email = "Введите email";
  else if (!EMAIL_RE.test(form.email)) e.email = "Некорректный email";
  if (form.role === "student" && !form.group.trim())
    e.group = "Укажите группу";
  return e;
}

export function validateRegisterStep2(
  form: RegisterFormData,
): FormErrors<RegisterFormData> {
  const e: FormErrors<RegisterFormData> = {};
  if (!form.password)
    e.password = "Введите пароль";
  else if (form.password.length < 8)
    e.password = "Минимум 8 символов";
  if (!form.confirmPassword)
    e.confirmPassword = "Подтвердите пароль";
  else if (form.password !== form.confirmPassword)
    e.confirmPassword = "Пароли не совпадают";
  return e;
}

// ─── Password strength ────────────────────────────────────────────────────────

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", color: C.border };

  let score = 0;
  if (password.length >= 8)                                         score++;
  if (password.length >= 12)                                        score++;
  if (/[A-ZА-Я]/.test(password) && /[a-zа-я]/.test(password))     score++;
  if (/\d/.test(password))                                          score++;

  const levels: Record<number, { label: string; color: string }> = {
    1: { label: "Слабый",   color: C.danger  },
    2: { label: "Средний",  color: C.amber   },
    3: { label: "Хороший",  color: C.primary },
    4: { label: "Сильный",  color: C.success },
  };

  const level = levels[score] ?? { label: "", color: C.border };
  return { score: score as PasswordStrength["score"], ...level };
}

// ─── Default form states ──────────────────────────────────────────────────────

export const DEFAULT_LOGIN_FORM: LoginFormData = {
  email:    "",
  password: "",
};

export const DEFAULT_REGISTER_FORM: RegisterFormData = {
  fullName:        "",
  email:           "",
  role:            "student",
  group:           "",
  password:        "",
  confirmPassword: "",
};