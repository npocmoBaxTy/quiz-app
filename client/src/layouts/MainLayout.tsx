import { Header } from "@/widgets/header/header";
import { Toaster } from "react-hot-toast";
import { Outlet, ScrollRestoration } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="wrapper bg-(--main-bg) min-h-screen w-full dark:bg-black overflow-hidden">
      <Header />
      <ScrollRestoration />

      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};
