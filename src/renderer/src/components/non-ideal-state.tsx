import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const nisVariants = cva("", {
  variants: {
    variant: {
      default: "text-foreground/75",
      error: "text-destructive-foreground",
      warning: "bg-warning",
      info: "bg-info",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export default function NonIdealState({
  icon,
  title,
  description,
  variant,
  className,
}: VariantProps<typeof nisVariants> & {
  icon?: React.ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-md",
        nisVariants({ variant }),
        className,
      )}
    >
      {icon && <div className="size-icon-lg">{icon}</div>}
      {title && <div className="font-semibold">{title}</div>}
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
    </div>
  );
}
