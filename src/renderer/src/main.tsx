import { TooltipProvider } from "@/components/ui/tooltip";
import "./assets/main.css";

import App from "@/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";

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
        <TooltipProvider>
          <MemoryRouter>
            <App />
          </MemoryRouter>
          {/* <ReactQueryDevtools initialIsOpen={!true} /> */}
        </TooltipProvider>
        {/* <ErrorBadge /> */}
      </QueryClientProvider>
    </StrictMode>,
  );
}
