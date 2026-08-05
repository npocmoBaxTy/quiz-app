import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Play, Clock, HelpCircle,
    Target, Award, ChevronRight, InfinityIcon, CheckCircle2
} from "lucide-react";
import { Sidebar } from "@/app/components/ui/sidebar";
import { Header } from "@/widgets/header/header";
import { Loader } from "@/widgets/Loader/Loader";
import { useAuthStore } from "@/features/auth/store/authstore";
import { useStudentQuizzesList, useStartQuiz } from "../QuizesListPage/hooks/useGetQuizzesList";
import { useStudentResultsList } from "../QuizesListPage/ResultsList/api";
import type { Quiz } from "../QuizesListPage/types";

const RESULTS_PREVIEW_COUNT = 4;
const QUIZZES_PREVIEW_COUNT = 4;

const DATE_LOCALES: Record<string, string> = {
    ru: "ru-RU",
    en: "en-US",
    uz: "uz-UZ",
};

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();

    const { data: quizzes, isLoading: isQuizzesLoading } = useStudentQuizzesList();
    const { data: resultsResponse, isLoading: isResultsLoading } = useStudentResultsList(1);
    const startMutation = useStartQuiz();

    const recentResults = resultsResponse?.data.slice(0, RESULTS_PREVIEW_COUNT);
    const upcomingQuizzes = quizzes?.slice(0, QUIZZES_PREVIEW_COUNT);

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const locale = DATE_LOCALES[i18n.language] ?? "ru-RU";
        return date.toLocaleDateString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    };

    const handleStart = (quizId: string) => {
        startMutation.mutate(quizId, {
            onSuccess: (data) => {
                navigate(`/student/quiz/${quizId}?attemptId=${data.attemptId}`);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-64">
                <Header />

                {/* MAIN DASHBOARD CONTENT */}
                <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8">

                    {/* WELCOME BANNER & STATS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-[24px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10">
                            {/* Декоративные элементы фона */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t("studentHome.greeting", { name: user?.full_name || t("studentHome.user") })}</h1>
                                    <p className="text-indigo-200 font-medium max-w-md leading-relaxed">
                                        {quizzes && quizzes.length > 0
                                            ? t("studentHome.quizzesAvailable", { count: quizzes.length })
                                            : t("studentHome.noQuizzesAvailable")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 mt-8">
                                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Target className="text-emerald-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">{t("studentHome.avgScore")}</p>
                                            <p className="font-bold text-xl leading-none">{averageScore !== null ? `${averageScore}%` : "—"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="text-amber-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">{t("studentHome.completedTests")}</p>
                                            <p className="font-bold text-xl leading-none">{completedTests}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <Award size={32} />
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 mb-1">{completedTests}</h3>
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t("studentHome.testsCompleted")}</p>
                            <button
                                onClick={() => navigate("/student/quizes")}
                                className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                            >
                                {t("studentHome.viewAllResults")} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* GRID: ACTIVE QUIZZES & RECENT RESULTS */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* LEFT COLUMN: ACTIVE QUIZZES */}
                        <div className="xl:col-span-2 flex flex-col gap-5">
                            <div className="flex justify-between items-end mb-1">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-indigo-600 rounded-full inline-block"></span>
                                    {t("studentHome.toComplete")}
                                </h2>
                                <button
                                    onClick={() => navigate("/student/quizes")}
                                    className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {t("studentHome.allAvailable")}
                                </button>
                            </div>

                            {isQuizzesLoading && <Loader />}

                            {!isQuizzesLoading && upcomingQuizzes?.length === 0 && (
                                <div className="bg-white rounded-[20px] p-8 border border-slate-200 shadow-sm text-center text-slate-500">
                                    {t("studentHome.noQuizzes")}
                                </div>
                            )}

                            {upcomingQuizzes?.map((quiz: Quiz) => {
                                const isUnlimited = !quiz.attempt_limit;
                                const attemptsLeft = isUnlimited ? null : quiz.attempt_limit! - quiz.used_attempts;
                                const isWarning = !isUnlimited && attemptsLeft !== null && attemptsLeft <= 1;

                                return (
                                    <div key={quiz.id} className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col sm:flex-row gap-5">

                                        {/* Left: Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{quiz.creator_name}</span>
                                                {isWarning && <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1">{t("studentHome.lastAttempt")}</span>}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 leading-snug mb-4 group-hover:text-indigo-600 transition-colors">
                                                {quiz.title}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                                    <Clock size={16} className="text-slate-400" />
                                                    {quiz.time_limit} {t("studentHome.min")}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                                    <HelpCircle size={16} className="text-slate-400" />
                                                    {quiz.questions_limit ?? "—"} {t("studentHome.questionsShort")}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                                    {isUnlimited ? (
                                                        <><InfinityIcon size={16} className="text-emerald-500" /> <span className="text-emerald-600">{t("studentHome.unlimited")}</span></>
                                                    ) : (
                                                        <><Target size={16} className={isWarning ? "text-rose-500" : "text-slate-400"} /> {t("studentHome.attemptsLeft", { left: attemptsLeft, total: quiz.attempt_limit })}</>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Action */}
                                        <div className="flex sm:flex-col justify-center items-center sm:items-end gap-4 sm:pl-6 sm:border-l border-slate-100">
                                            <button
                                                onClick={() => handleStart(quiz.id)}
                                                disabled={startMutation.isPending}
                                                className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60"
                                            >
                                                {startMutation.isPending ? t("studentHome.loading") : t("studentHome.start")}
                                                <Play size={16} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* RIGHT COLUMN: RECENT ACTIVITY */}
                        <div className="flex flex-col gap-5">
                            <div className="flex justify-between items-end mb-1">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                                    {t("studentHome.recentSubmissions")}
                                </h2>
                            </div>

                            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                {isResultsLoading && (
                                    <div className="p-8 flex justify-center">
                                        <Loader />
                                    </div>
                                )}

                                {!isResultsLoading && recentResults?.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        {t("studentHome.noResultsYet")}
                                    </div>
                                )}

                                {recentResults?.map((result, idx) => {
                                    const percentage = result.maxScore > 0
                                        ? Math.round((result.score / result.maxScore) * 100)
                                        : 0;
                                    const isPass = percentage >= result.passingScore;

                                    return (
                                        <div
                                            key={result.attemptId}
                                            className={`p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${idx !== recentResults.length - 1 ? 'border-b border-slate-100' : ''}`}
                                            onClick={() => navigate(`/student/results/${result.attemptId}`)}
                                        >
                                            <div className="flex-1 pr-4">
                                                <p className="text-xs text-slate-400 font-bold mb-1">{formatDate(result.completedAt)}</p>
                                                <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1">{result.quizTitle}</h4>
                                                <p className="text-xs text-slate-500">{result.teacherName}</p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-[3px] ${isPass ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-rose-100 bg-rose-50 text-rose-600'}`}>
                                                    <span className="font-black text-sm">{percentage}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">{result.score} / {result.maxScore}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                <button
                                    onClick={() => navigate("/student/quizes")}
                                    className="w-full py-4 bg-slate-50 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors border-t border-slate-100"
                                >
                                    {t("studentHome.showAllHistory")}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
