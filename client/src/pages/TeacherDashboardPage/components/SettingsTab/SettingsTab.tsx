import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Camera, KeyRound, Loader2, Mail, Save, Shield, User } from "lucide-react";
import { Header } from "@/widgets/header/header";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { useAuthStore } from "@/features/auth/store/authstore";
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUploadAvatar,
} from "@/pages/StudentProfilePage/hooks/useProfile";
import type { ApiErrorPayload, ProfileData } from "@/pages/StudentProfilePage/api";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const DATE_LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

export function SettingsTab() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <main className="flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      </main>
    );
  }

  // Форму монтируем только с готовым профилем — тогда поля инициализируются
  // сразу и не нужно догонять данные эффектом
  return <SettingsContent profile={profile} />;
}

function SettingsContent({ profile }: { profile: ProfileData }) {
  const { t, i18n } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const storeUser = useAuthStore((s) => s.user);

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadAvatarMutation = useUploadAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const errorMessage = (err: unknown) => {
    const code = (err as AxiosError<ApiErrorPayload>)?.response?.data?.code;
    if (code && t(`profile.errors.${code}`, { defaultValue: "" })) {
      return t(`profile.errors.${code}`);
    }
    return t("profile.errors.UNKNOWN_ERROR");
  };

  // Группа у преподавателя отсутствует, поэтому groupId не отправляем
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      toast.error(t("profile.errors.NAME_TOO_SHORT"));
      return;
    }

    updateProfileMutation.mutate(
      { fullName: trimmedName },
      {
        onSuccess: (data) => {
          if (storeUser) login({ ...storeUser, full_name: data.full_name });
          toast.success(t("profile.saved"));
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t("profile.errors.PASSWORD_TOO_SHORT"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("profile.security.passwordMismatch"));
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success(t("profile.security.passwordChanged"));
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.avatar.selectImageFile"));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(t("profile.avatar.maxFileSize"));
      return;
    }

    uploadAvatarMutation.mutate(file, {
      onSuccess: (data) => {
        if (storeUser) login({ ...storeUser, avatar_url: data.avatar_url });
        toast.success(t("profile.avatar.updated"));
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(
        DATE_LOCALES[i18n.language] ?? "ru-RU",
        { day: "numeric", month: "long", year: "numeric" },
      )
    : null;

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      <div className="p-8 w-full flex-1 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {t("teacherSettings.title", "Настройки")}
          </h1>
          <p className="text-slate-500 mt-1">
            {t("teacherSettings.subtitle", "Ваш профиль и безопасность аккаунта")}
          </p>
        </div>

        {/* ПРОФИЛЬ */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
            <User size={20} className="text-blue-600" />
            {t("profile.personalInfo")}
          </h2>

          <div className="flex flex-col sm:flex-row gap-8">
            {/* Аватар */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.full_name}
                  size={96}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                  aria-label={t("profile.avatar.change")}
                  className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
                >
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
              {memberSince && (
                <p className="text-xs text-slate-400 text-center">
                  {t("profile.memberSince", { date: memberSince })}
                </p>
              )}
            </div>

            {/* Поля */}
            <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t("profile.fullNameLabel")}
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t("profile.emailLabel")}
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={profile.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  {t("profile.emailReadonlyHint")}
                </p>
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="self-start flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-blue-200 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {t("profile.saveChanges")}
              </button>
            </form>
          </div>
        </section>

        {/* БЕЗОПАСНОСТЬ */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
            <Shield size={20} className="text-blue-600" />
            {t("profile.security.title")}
          </h2>

          <form
            onSubmit={handleChangePassword}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <PasswordField
              label={t("profile.security.currentPassword")}
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <PasswordField
              label={t("profile.security.newPassword")}
              value={newPassword}
              onChange={setNewPassword}
            />
            <PasswordField
              label={t("teacherSettings.confirmPassword", "Повторите пароль")}
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <KeyRound size={18} />
                )}
                {t("profile.security.changePassword")}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
      />
    </div>
  );
}
