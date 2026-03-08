import { useSyncExternalStore } from "react";
import { CardsRow, Rating } from "src/lib/schema";
import { schedule, ScheduleResult } from "src/lib/schedule";
import { useCardReviews } from "@/queries/review-queries";
import { IconInfoCircle } from "@tabler/icons-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./ui/sheet";

// --- useDebugMode hook ---

function getDebugMode() {
  return localStorage.getItem("debug-show-card-info") === "true";
}

function subscribe(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === "debug-show-card-info") cb();
  };
  // Listen for changes from other tabs
  window.addEventListener("storage", handler);
  // Listen for changes from same tab (localStorage.setItem doesn't fire "storage" in the same tab)
  const orig = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key: string, value: string) => {
    orig(key, value);
    if (key === "debug-show-card-info") cb();
  };
  return () => {
    window.removeEventListener("storage", handler);
    localStorage.setItem = orig;
  };
}

export function useDebugMode() {
  return useSyncExternalStore(subscribe, getDebugMode, () => false);
}

// --- Helpers ---

const RATINGS: Rating[] = ["forgot", "hard", "good", "easy"];

function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)}h`;
  const days = Math.round(minutes / (24 * 60));
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

function formatEF(ef: number): string {
  return (ef / 1000).toFixed(2);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Inline debug info bar ---

export function ReviewDebugInfo({ card }: { card: CardsRow }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono mt-2 px-1">
      <span
        className={`font-semibold ${
          card.status === "new"
            ? "text-blue-500"
            : card.status === "learning"
              ? "text-amber-500"
              : "text-green-500"
        }`}
      >
        {card.status}
      </span>
      <span>n={card.n}</span>
      <span>EF={formatEF(card.easeFactor)}</span>
      <span>int={formatInterval(card.interval)}</span>
      <span>due={formatDate(card.dueDate)}</span>
      <span>last={formatDate(card.lastReview)}</span>
    </div>
  );
}

// --- Debug sheet panel ---

export function ReviewDebugSheet({
  card,
  queuePosition,
  queueTotal,
}: {
  card: CardsRow;
  queuePosition: number;
  queueTotal: number;
}) {
  const { data: reviews } = useCardReviews(card.id);

  const previews: { rating: Rating; result: ScheduleResult }[] = RATINGS.map(
    (rating) => ({
      rating,
      result: schedule(card, rating),
    }),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="ml-1">
          <IconInfoCircle className="size-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Card Debug Info</SheetTitle>
          <SheetDescription>SM-2 scheduling details</SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-5 text-sm">
          {/* Queue info */}
          <Section title="Queue">
            <Row label="Position" value={`${queuePosition + 1} / ${queueTotal}`} />
            <Row label="Remaining" value={`${queueTotal - queuePosition}`} />
          </Section>

          {/* Card metadata */}
          <Section title="Card State">
            <Row label="ID" value={card.id} mono />
            <Row label="Status" value={card.status} />
            <Row label="Repetitions (n)" value={card.n} />
            <Row label="Ease Factor" value={formatEF(card.easeFactor)} />
            <Row label="Interval" value={formatInterval(card.interval)} />
            <Row label="Due Date" value={formatDate(card.dueDate)} />
            <Row label="Last Review" value={formatDate(card.lastReview)} />
            <Row label="Created" value={formatDate(card.createdAt)} />
          </Section>

          {/* Scheduling preview */}
          <Section title="Scheduling Preview">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-3 gap-y-1 text-xs">
              <div className="font-medium text-muted-foreground">Rating</div>
              <div className="font-medium text-muted-foreground">Interval</div>
              <div className="font-medium text-muted-foreground">EF</div>
              <div className="font-medium text-muted-foreground">Status</div>
              {previews.map(({ rating, result }) => (
                <>
                  <div key={`${rating}-label`} className="font-medium capitalize">{rating}</div>
                  <div key={`${rating}-int`} className="font-mono">{formatInterval(result.interval)}</div>
                  <div key={`${rating}-ef`} className="font-mono">{formatEF(result.easeFactor)}</div>
                  <div key={`${rating}-status`}>{result.status}</div>
                </>
              ))}
            </div>
          </Section>

          {/* Review history */}
          <Section title="Review History">
            {!reviews || reviews.length === 0 ? (
              <div className="text-muted-foreground text-xs">No reviews yet</div>
            ) : (
              <div className="space-y-1 text-xs max-h-48 overflow-y-auto">
                {reviews.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </span>
                    <span className="font-medium capitalize">{r.rating}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Small helper components ---

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2 py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs" : ""} truncate max-w-[200px]`}>
        {value}
      </span>
    </div>
  );
}
