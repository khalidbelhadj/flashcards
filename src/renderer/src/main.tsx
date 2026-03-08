import { TooltipProvider } from "@/components/ui/tooltip";
import "./assets/main.css";

import App from "@/app";
import { isNewCardMode } from "@/main-utils";
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

// Cross-window query invalidation
window.electron.ipcRenderer.on("invalidate-queries", (_event, queryKeys: string[]) => {
  for (const key of queryKeys) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
});

const initialEntries = isNewCardMode() ? ["/new-card"] : ["/"];

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <App />
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
