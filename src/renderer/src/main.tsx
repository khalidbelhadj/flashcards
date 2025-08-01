import "./assets/main.css";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "@/app";
import {
  createHashRouter,
  HashRouter,
  MemoryRouter,
  RouterProvider,
} from "react-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
        {/* <ReactQueryDevtools initialIsOpen={!true} /> */}
      </QueryClientProvider>
    </StrictMode>,
  );
}
