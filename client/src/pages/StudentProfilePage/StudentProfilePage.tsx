import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
    Award,
    Camera,
    CheckCircle2,
    KeyRound,
    Loader2,
    Mail,
    Save,
    Shield,
    User,
    Users,
} from "lucide-react";
import { Sidebar } from "@/app/components/ui/sidebar";
import { Header } from "@/widgets/header/header";
import { Loader } from "@/widgets/Loader/Loader";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { useAuthStore } from "@/features/auth/store/authstore";
import { useGroups } from "@/features/auth/hooks/useGroups";
import { useStudentResultsList } from "../QuizesListPage/ResultsList/api";
import { useProfile, useUpdateProfile, useChangePassword, useUploadAvatar } from "./hooks/useProfile";
import type { ApiErrorPayload } from "./api";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const DATE_LOCALES: Record<string, string> = {
    ru: "ru-RU",
    en: "en-US",
    uz: "uz-UZ",
};

export default function StudentProfilePage() {
    const { t, i18n } = useTranslation();
    const login = useAuthStore((s) => s.login);
    const storeUser = useAuthStore((s) => s.user);

    const { data: profile, isLoading: isProfileLoading } = useProfile();
    const { groups, isLoading: isGroupsLoading } = useGroups();
    const { data: resultsResponse } = useStudentResultsList(1);
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const uploadAvatarMutation = useUploadAvatar();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState("");
    const [groupId, setGroupId] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name);
            setGroupId(profile.group?.id ?? "");
        }
    }, [profile]);

    const completedTests = resultsResponse?.meta.total ?? 0;
    const averageScore = useMemo(() => {
        const results = resultsResponse?.data;
        if (!results || results.length === 0) return null;
        const percentages = results
            .filter((r) => r.maxScore > 0)
            .map((r) => (r.score / r.maxScore) * 100);
        if (percentages.length === 0) return null;
        return Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length);
    }, [resultsResponse]);

    const errorMessage = (err: unknown) => {
        const code = (err as AxiosError<ApiErrorPayload>)?.response?.data?.code;
        if (code && t(`profile.errors.${code}`, { defaultValue: "" })) {
            return t(`profile.errors.${code}`);
        }
        return t("profile.errors.UNKNOWN_ERROR");
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = fullName.trim();
        if (trimmedName.length < 2) {
            toast.error(t("profile.errors.NAME_TOO_SHORT"));
            return;
        }

        updateProfileMutation.mutate(
            {
                fullName: trimmedName,
                ...(groupId ? { groupId } : {}),
            },
            {
                onSuccess: (data) => {
                    if (storeUser) {
                        login({ ...storeUser, full_name: data.full_name });
                    }
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
                if (storeUser) {
                    login({ ...storeUser, avatar_url: data.avatar_url });
                }
                toast.success(t("profile.avatar.updated"));
            },
            onError: (err) => toast.error(errorMessage(err)),
        });
    };

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString(
            DATE_LOCALES[i18n.language] ?? "ru-RU",
            { day: "numeric", month: "long", year: "numeric" },
        )
        : null;

    if (isProfileLoading || !profile) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen lg:ml-64">
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <Loader />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-64">
                <Header />

                <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full flex-1 flex flex-col gap-8">

                    {/* HERO */}
                    <div className="bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-[24px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="relative shrink-0 group">
                                <div className="rounded-full border-2 border-white/20 overflow-hidden">
                                    <Avatar src={profile.avatar_url} name={profile.full_name} size={80} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={uploadAvatarMutation.isPending}
                                    title={t("profile.avatar.change")}
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all disabled:opacity-100"
                                >
                                    {uploadAvatarMutation.isPending ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Camera size={20} />
                                    )}
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    className="hidden"
                                    onChange={(e) => {
                                        handleAvatarChange(e.target.files?.[0]);
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">{profile.full_name}</h1>
                                <p className="text-indigo-200 font-medium">{profile.email}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                        {profile.role}
                                    </span>
                                    {profile.group?.name && (
                                        <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-md">
                                            {profile.group.name}
                                        </span>
                                    )}
                                    {memberSince && (
                                        <span className="text-xs text-indigo-200">
                                            {t("profile.memberSince", { date: memberSince })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <Award size={26} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none mb-1">{completedTests}</p>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    {t("studentHome.testsCompleted")}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={26} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none mb-1">
                                    {averageScore !== null ? `${averageScore}%` : "—"}
                                </p>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    {t("studentHome.avgScore")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* PERSONAL INFO */}
                        <form
                            onSubmit={handleSaveProfile}
                            className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-5 h-fit"
                        >
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-6 bg-indigo-600 rounded-full inline-block"></span>
                                {t("profile.personalInfo")}
                            </h2>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    {t("profile.fullNameLabel")}
                                </label>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                    <User size={16} className="text-slate-400 shrink-0" />
                                    <input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="flex-1 py-2.5 outline-none text-sm text-slate-800 bg-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    {t("auth.labels.group")}
                                </label>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                    <Users size={16} className="text-slate-400 shrink-0" />
                                    <select
                                        value={groupId}
                                        onChange={(e) => setGroupId(e.target.value)}
                                        disabled={isGroupsLoading}
                                        className="flex-1 py-2.5 outline-none text-sm text-slate-800 bg-transparent disabled:opacity-50"
                                    >
                                        <option value="">{t("auth.labels.selectGroup")}</option>
                                        {groups.map((g) => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    {t("profile.emailLabel")}
                                </label>
                                <div className="flex items-center gap-2 border border-slate-100 bg-slate-50 rounded-xl px-3.5">
                                    <Mail size={16} className="text-slate-400 shrink-0" />
                                    <input
                                        value={profile.email}
                                        disabled
                                        className="flex-1 py-2.5 outline-none text-sm text-slate-500 bg-transparent cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">{t("profile.emailReadonlyHint")}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="mt-2 flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60"
                            >
                                <Save size={16} />
                                {updateProfileMutation.isPending ? t("studentHome.loading") : t("profile.saveChanges")}
                            </button>
                        </form>

                        {/* SECURITY */}
                        <form
                            onSubmit={handleChangePassword}
                            className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-5 h-fit"
                        >
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                                {t("profile.security.title")}
                            </h2>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    {t("profile.security.currentPassword")}
                                </label>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                    <KeyRound size={16} className="text-slate-400 shrink-0" />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="flex-1 py-2.5 outline-none text-sm text-slate-800 bg-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    {t("profile.security.newPassword")}
                                </label>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                    <Shield size={16} className="text-slate-400 shrink-0" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={t("auth.labels.minPass")}
                                        className="flex-1 py-2.5 outline-none text-sm text-slate-800 bg-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    {t("auth.labels.confirmPassLabel")}
                                </label>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                    <Shield size={16} className="text-slate-400 shrink-0" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="flex-1 py-2.5 outline-none text-sm text-slate-800 bg-transparent"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                                className="mt-2 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-60"
                            >
                                <KeyRound size={16} />
                                {changePasswordMutation.isPending ? t("studentHome.loading") : t("profile.security.changePassword")}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
