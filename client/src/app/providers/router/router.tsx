import { QuizAttemptsPage } from "@/features/getAttemptDetails";
import { QuizBuilder } from "@/features/quizCreate/quizCreator";
import { MainLayout } from "@/layouts/MainLayout";
import { AccessDeniedPage } from "@/pages/403/403";
import NotFoundPage from "@/pages/404/404";
import { AttemptDetailsPage } from "@/pages/AttemptDetailsPage/AttemptDetailsPage";
import { UserRegisterPage } from "@/pages/AuthPage/RegisterPage";
import { UserLoginPage } from "@/pages/AuthPage/UserLoginPage";
import { QuizesPAge } from "@/pages/QuizesListPage/QuizesListPage";
import { QuizTaking } from "@/pages/QuizTaking";
import StudentDashboard from "@/pages/StudentHomePage/StudentHomePage";
import { StudentAnalyticsPage } from "@/pages/StudentAnalyticsPage";
import StudentProfilePage from "@/pages/StudentProfilePage/StudentProfilePage";
import { StudentResultDetailsPage } from "@/pages/StudentResultDetailsPage";
import TeacherDashboard from "@/pages/TeacherDashboardPage";
import { TeacherQuizesPage } from "@/pages/TeacherQuizesPage/TeacherQuizesPage";
import { ProtectedRoute } from "@/shared/lib/router/ProtectedRoute";
import { Main } from "@/widgets/main/homePage";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, ScrollRestoration } from "react-router-dom";

export const router = createBrowserRouter([
  // ==========================================
  // ГРУППА 1: СТРАНИЦЫ БЕЗ ШАПКИ И ФУТЕРА
  // (Полноэкранные приложения, Дашборды, Авторизация)
  // ==========================================
  {
    path: "/user/profile",
    element: (
      <ProtectedRoute allowedRoles={["TEACHER"]}>
        <>
          <TeacherDashboard />
          <ScrollRestoration />
          <Toaster />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/teacher/quizzes/:quizId/attempts",
    element: (
      <>
        <ProtectedRoute allowedRoles={["TEACHER"]}>
          <>
            <QuizAttemptsPage />
            <ScrollRestoration />
          </>
        </ProtectedRoute>
      </>
    ),
  },
  {
    path: "/teacher/student-attempt/:attemptId",
    element: (
      <>
        <Toaster />
        <AttemptDetailsPage />
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/user/login",
    element: <UserLoginPage />,
  },
  {
    path: "/user/register",
    element: (
      <>
        <UserRegisterPage />
        <ScrollRestoration />
        <Toaster />
      </>
    ),
  },
  {
    path: "/student/results/:attemptId",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <>
          <ScrollRestoration />
          <StudentResultDetailsPage />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/profile",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <>
          <StudentProfilePage />
          <ScrollRestoration />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/analytics",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <>
          <StudentAnalyticsPage />
          <ScrollRestoration />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/home",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <>
          <StudentDashboard />
          <ScrollRestoration />
        </>
      </ProtectedRoute>
    ),
  },
  {
    // Маршрут для создания теста с нуля
    path: "/teacher/create-quiz",
    element: (
      <ProtectedRoute allowedRoles={["TEACHER"]}>
        <>
          <QuizBuilder />
          <ScrollRestoration />
          <Toaster />
        </>
      </ProtectedRoute>
    ),
  },
  {
    // 2. Маршрут для РЕДАКТИРОВАНИЯ существующего теста
    path: "/teacher/edit-quiz/:quizId",
    element: (
      <ProtectedRoute allowedRoles={["TEACHER"]}>
        <>
          <QuizBuilder />
          <ScrollRestoration />
          <Toaster />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/quiz/:quizId",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <>
          <QuizTaking />
          <ScrollRestoration />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/forbidden",
    element: <AccessDeniedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },

  // ==========================================
  // ГРУППА 2: СТРАНИЦЫ С MAIN LAYOUT
  // (С глобальной шапкой и футером)
  // ==========================================
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Main />,
      },
      {
        path: "/student",
        element: <div>student</div>,
      },
      {
        path: "/student/quizes",
        element: (
          <ProtectedRoute allowedRoles={["STUDENT", "TEACHER"]}>
            <>
              <QuizesPAge />
              <ScrollRestoration />
            </>
          </ProtectedRoute>
        ),
      },
      {
        path: "/teacher/quizes",
        element: (
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <>
              <TeacherQuizesPage />
              <ScrollRestoration />
            </>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
