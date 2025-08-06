import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  children,
  icon,
  rightElement,
  ...props
}: React.ComponentProps<"input"> & {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  if (icon) {
    return (
      <div
        className={cn(
          "items-center relative file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-7 w-full min-w-0 rounded-md border bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-sm",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "flex gap-1 items-center px-2 py-1  min-w-0",
          className,
        )}
      >
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          data-slot="input"
          className={cn(
            "focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none flex-1",
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-7 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
