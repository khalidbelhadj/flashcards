import { useState } from "react";
import { useNavigate } from "react-router";
import { IconChevronRight, IconLoader } from "@tabler/icons-react";
import { useDecks } from "@/queries/deck-queries";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function DeckTreeChildren({ parentId, depth }: { parentId: string; depth: number }) {
  const { data: children, isPending } = useDecks(parentId);

  if (isPending) {
    return (
      <tr>
        <td colSpan={2} style={{ paddingLeft: `${depth * 20 + 12}px` }} className="py-2">
          <IconLoader className="size-3.5 animate-spin text-muted-foreground" />
        </td>
      </tr>
    );
  }

  return children?.map((child) => (
    <DeckTreeRow
      key={child.id}
      id={child.id}
      name={child.name}
      newCount={child.new}
      learning={child.learning}
      reviewing={child.reviewing}
      depth={depth}
    />
  ));
}

function ProgressBar({
  newCount,
  learning,
  reviewing,
}: {
  newCount: number;
  learning: number;
  reviewing: number;
}) {
  const total = newCount + learning + reviewing;

  if (total === 0) {
    return <div className="h-2 w-full rounded-[2px] border border-border/50 bg-muted/30" />;
  }

  const parts = [
    { pct: (newCount / total) * 100, bg: "bg-blue-500/15", border: "border-blue-500/40", label: `${newCount} new`, count: newCount },
    { pct: (learning / total) * 100, bg: "bg-orange-500/15", border: "border-orange-500/40", label: `${learning} learning`, count: learning },
    { pct: (reviewing / total) * 100, bg: "bg-green-500/15", border: "border-green-500/40", label: `${reviewing} due`, count: reviewing },
  ];

  return (
    <div className="flex h-2 w-full gap-0.5">
      {parts.map(
        (part) =>
          part.count > 0 && (
            <Tooltip key={part.label}>
              <TooltipTrigger asChild>
                <div
                  className={cn("h-full rounded-[2px] border", part.bg, part.border)}
                  style={{ width: `${part.pct}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>{part.label}</TooltipContent>
            </Tooltip>
          )
      )}
    </div>
  );
}

function DeckTreeRow({
  id,
  name,
  newCount,
  learning,
  reviewing,
  depth,
}: {
  id: string;
  name: string;
  newCount: number;
  learning: number;
  reviewing: number;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <tr
        className="group hover:bg-muted/50 cursor-pointer"
        onClick={() => navigate(`/deck/${id}`)}
      >
        <td className="py-2 pr-4" style={{ paddingLeft: `${depth * 20 + 12}px` }}>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="shrink-0 p-0.5 rounded"
            >
              <IconChevronRight
                className={cn(
                  "size-4 text-muted-foreground",
                  expanded && "rotate-90"
                )}
              />
            </button>
            <span className="truncate text-sm">{name}</span>
          </div>
        </td>
        <td className="py-2 px-3 w-28">
          <ProgressBar newCount={newCount} learning={learning} reviewing={reviewing} />
        </td>
      </tr>
      {expanded && <DeckTreeChildren parentId={id} depth={depth + 1} />}
    </>
  );
}

export function DeckTree() {
  const { data: roots, isPending, isError } = useDecks(null);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader className="size-5 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8 text-destructive text-sm font-medium">
        Error loading decks
      </div>
    );
  }

  if (roots.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        No decks yet
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b text-xs text-muted-foreground">
          <th className="py-2 pl-3 pr-4 text-left font-medium">Deck</th>
          <th className="py-2 px-3 text-left font-medium w-28">Progress</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/50">
        {roots.map((deck) => (
          <DeckTreeRow
            key={deck.id}
            id={deck.id}
            name={deck.name}
            newCount={deck.new}
            learning={deck.learning}
            reviewing={deck.reviewing}
            depth={0}
          />
        ))}
      </tbody>
    </table>
  );
}
