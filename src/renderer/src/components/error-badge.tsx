import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// ErrorBadge
// -----------------------------------------------------------------------------
// A small floating badge that keeps track of all console errors / warnings as
// well as global error events. Clicking the badge expands a panel that lists
// the captured errors.
//
// The previous implementation re-attached the console overrides every time a
// new error was pushed (because the effect depended on `errorId`). On the
// second render the "original" console methods were already the overridden
// ones which led to infinite recursion and eventually locked up the whole app
// when the badge was clicked. The new version only installs the overrides once
// on mount and keeps a stable reference to the id counter via useRef.
// -----------------------------------------------------------------------------

type TError = {
  id: number;
  message: string;
  timestamp: Date;
  severity: "error" | "warning";
};

export default function ErrorBadge() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [errors, setErrors] = useState<TError[]>([]);

  // keep the incremental id outside of React state so the effect does not need
  // to re-run whenever the counter changes.
  const errorIdRef = useRef(1);

  // ---------------------------------------------------------------------------
  // Side-effect: hook into console + global error handlers (run once on mount).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Preserve original console methods so we can still output to the developer
    // console while capturing the messages for the UI.
    const originalError = console.error;
    const originalWarn = console.warn;

    const addEntry = (severity: "error" | "warning", message: string) => {
      setErrors((prev) => {
        const id = errorIdRef.current++;
        return [
          ...prev,
          {
            id,
            message,
            timestamp: new Date(),
            severity,
          },
        ];
      });
    };

    // -------------------------------------------------------------------------
    // Override console.error
    // -------------------------------------------------------------------------
    console.error = (...args: unknown[]) => {
      // Keep default behaviour
      originalError.apply(console, args);

      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(" ");

      addEntry("error", message);
    };

    // -------------------------------------------------------------------------
    // Override console.warn
    // -------------------------------------------------------------------------
    console.warn = (...args: unknown[]) => {
      originalWarn.apply(console, args);

      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(" ");

      addEntry("warning", message);
    };

    // -------------------------------------------------------------------------
    // Global error listeners
    // -------------------------------------------------------------------------
    const handleError = (event: ErrorEvent) => {
      addEntry(
        "error",
        `${event.error?.message || event.message} at ${event.filename}:${event.lineno}`,
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addEntry("error", `Unhandled Promise Rejection: ${event.reason}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup – restore original console methods and listeners
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []); // <-- run once

  // ---------------------------------------------------------------------------
  // UI helpers
  // ---------------------------------------------------------------------------
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const clearError = (id: number) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  };

  const clearAllErrors = () => setErrors([]);

  const formatTime = (timestamp: Date) =>
    timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

  const getSeverityColor = (severity: "error" | "warning") => {
    switch (severity) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // Don't render anything if there are no errors yet.
  if (errors.length === 0) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Expanded panel */}
      {isExpanded && (
        <div className="mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900">
              Errors ({errors.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearAllErrors}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
              <button
                onClick={toggleExpanded}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error list */}
          <div className="max-h-64 overflow-y-auto">
            {errors.map((error) => (
              <div
                key={error.id}
                className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle
                        className={`w-4 h-4 ${getSeverityColor(error.severity)}`}
                      />
                      <span className="text-xs text-gray-500">
                        {formatTime(error.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 break-words">
                      {error.message}
                    </p>
                  </div>
                  <button
                    onClick={() => clearError(error.id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge */}
      <Button onClick={toggleExpanded} variant="destructive" size="icon-sm">
        <span className="text-sm font-medium">{errors.length}</span>
      </Button>
    </div>
  );
}
