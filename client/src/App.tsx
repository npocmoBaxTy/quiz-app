import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./app/providers/auth/AuthProvider";
import { QueryProvider } from "./app/providers/quizes/QueryProvider";
import { AppRouter } from "./app/providers/router/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <QueryProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </QueryClientProvider>
  );
}

export default App;
