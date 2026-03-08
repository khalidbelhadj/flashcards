import DeckDropdown from "@/components/deck-dropdown";
import NonIdealState from "@/components/non-ideal-state";
import ProjectIcon from "@/components/project-icon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeckDialogue } from "@/contexts/deck-dialogue-context";
import {
  buildTree,
  cn,
  Deck,
  DeckWithDepth,
  flatten,
  prefetchDeck,
} from "@/lib/utils";
import { useDecksRecursive, useMoveDeck } from "@/queries/deck-queries";
import { IconChevronRight, IconDots, IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { NavLink } from "react-router";
import { Badge } from "./ui/badge";

interface DecksHeaderProps {
  isPending: boolean;
  isError: boolean;
  allDecks: Deck[];
  dragOverHeader: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

function DecksHeader({
  isPending,
  isError,
  allDecks,
  dragOverHeader,
  onDragOver,
  onDragLeave,
  onDrop,
}: DecksHeaderProps) {
  const { openDialogue } = useDeckDialogue();

  return (
    <div
      className={cn(
        "px-2 py-1 pr-1 gap-1 border-b flex items-center justify-between transition-colors",
        dragOverHeader && "bg-blue-100 dark:bg-blue-900/30",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="font-medium text-muted-foreground flex items-center gap-2">
        Decks
        {!isPending && !isError && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-muted" variant="secondary">
                {allDecks.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{allDecks.length} decks</TooltipContent>
          </Tooltip>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="ml-auto"
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              openDialogue({ type: "new", id: null });
            }}
            icon={<IconPlus className="text-muted-foreground" />}
          />
        </TooltipTrigger>
        <TooltipContent>Create a new deck</TooltipContent>
      </Tooltip>
    </div>
  );
}

interface DeckRowProps {
  deck: DeckWithDepth;
  expanded: Set<string>;
  draggedDeck: string | null;
  dragOverDeck: string | null;
  isDragging: boolean;
  descendants: Set<string>;
  onDragStart: (e: React.DragEvent, deckId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, deckId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, deckId: string) => void;
  onToggleExpanded: (id: string) => void;
}

function DeckRow({
  deck,
  expanded,
  draggedDeck,
  dragOverDeck,
  isDragging,
  descendants,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onToggleExpanded,
}: DeckRowProps) {
  const queryClient = useQueryClient();
  return (
    <NavLink
      key={deck.id}
      to={`/decks/${deck.id}`}
      draggable
      className={cn(
        "flex items-center gap-0.5 p-0.5 hover:bg-accent font-medium relative group",
        draggedDeck === deck.id && "opacity-50",
        dragOverDeck === deck.id && "bg-blue-100 dark:bg-blue-900/30",
        isDragging && draggedDeck === deck.id && "cursor-grabbing",
        draggedDeck &&
          descendants.has(deck.id) &&
          "cursor-not-allowed opacity-50",
      )}
      onDragStart={(e) => onDragStart(e, deck.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, deck.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, deck.id)}
      onMouseOver={() => prefetchDeck(deck.id, queryClient)}
    >
      {Array.from({ length: deck.depth }).map((_, i) => (
        <div className="w-6" key={i}></div>
      ))}
      <Button
        className="hover:bg-muted !p-0"
        size="icon-sm"
        variant="ghost"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (deck.childCount === 0) return;
          onToggleExpanded(deck.id);
        }}
      >
        <ProjectIcon className="size-icon group-hover:hidden" />
        <IconChevronRight
          className={cn(
            "size-icon hidden group-hover:inline-block transition-transform",
            deck.childCount === 0 && "text-muted-foreground",
            expanded.has(deck.id) && deck.childCount > 0 && "rotate-90",
          )}
        />
      </Button>

      <div className="flex-1 truncate">{deck.name}</div>
      <div className="flex items-center gap-0.5 w-20 shrink-0">
        {deck.cardCount > 0 ? (
          <>
            {deck.new > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="h-2 rounded-[2px] border border-blue-500/50 bg-blue-500/15"
                    style={{ flex: deck.new }}
                  />
                </TooltipTrigger>
                <TooltipContent>{deck.new} new</TooltipContent>
              </Tooltip>
            )}
            {deck.learning > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="h-2 rounded-[2px] border border-orange-500/50 bg-orange-500/15"
                    style={{ flex: deck.learning }}
                  />
                </TooltipTrigger>
                <TooltipContent>{deck.learning} learning</TooltipContent>
              </Tooltip>
            )}
            {deck.reviewing > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="h-2 rounded-[2px] border border-green-500/50 bg-green-500/15"
                    style={{ flex: deck.reviewing }}
                  />
                </TooltipTrigger>
                <TooltipContent>{deck.reviewing} due</TooltipContent>
              </Tooltip>
            )}
          </>
        ) : (
          <div className="h-3 w-full rounded-[2px] border border-border/50 bg-muted/30" />
        )}
      </div>
      <DeckDropdown deck={deck}>
        <Button
          className="p-1 h-full w-fit ml-auto hover:bg-muted"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <IconDots className="size-icon" />
        </Button>
      </DeckDropdown>
    </NavLink>
  );
}

export default function Decks() {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const value = localStorage.getItem("expanded");
    if (value === null) return new Set();
    try {
      const stored = JSON.parse(value);
      return new Set(stored);
    } catch (e) {
      return new Set();
    }
  });

  const { data: allDecks, isPending, isError } = useDecksRecursive(null);
  const { mutateAsync: moveDeck } = useMoveDeck();

  // Drag and drop state
  const [draggedDeck, setDraggedDeck] = useState<string | null>(null);
  const [dragOverDeck, setDragOverDeck] = useState<string | null>(null);
  const [dragOverHeader, setDragOverHeader] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const descendants = useMemo(() => {
    if (!draggedDeck) return new Set<string>();
    const result = new Set<string>();
    const stack = [draggedDeck];
    while (stack.length > 0) {
      const deckId = stack.pop();
      result.add(deckId!);
      const newDecks = allDecks?.filter((d) => d.parentId === deckId);
      if (newDecks) {
        stack.push(...newDecks.map((d) => d.id));
      }
    }
    return result;
  }, [draggedDeck, allDecks]);

  let decks = useMemo(() => {
    const result =
      allDecks !== undefined ? flatten(buildTree(allDecks), expanded) : [];
    return result;
  }, [allDecks, expanded]);

  const setExpandedSaved = (newExpanded: Set<string>) => {
    localStorage.setItem("expanded", JSON.stringify(Array.from(newExpanded)));
    setExpanded(new Set(newExpanded));
  };

  const toggleExpanded = (id: string) => {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }

    setExpandedSaved(new Set(expanded));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, deckId: string) => {
    setDraggedDeck(deckId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", deckId);
  };

  const handleDragEnd = () => {
    setDraggedDeck(null);
    setDragOverDeck(null);
    setDragOverHeader(false);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, targetDeckId: string) => {
    e.preventDefault();

    // Don't allow dropping on self or descendants
    if (
      draggedDeck &&
      (draggedDeck === targetDeckId || descendants.has(targetDeckId))
    ) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";

    // Only set drag over if it's different from the dragged deck and not a descendant
    if (draggedDeck !== targetDeckId) {
      setDragOverDeck(targetDeckId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Clear drag over when leaving a specific deck item
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setDragOverDeck(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetDeckId: string) => {
    e.preventDefault();

    const draggedDeckId = e.dataTransfer.getData("text/plain");
    if (!draggedDeckId || draggedDeckId === targetDeckId) {
      return;
    }

    // Don't allow dropping on descendants
    if (descendants.has(targetDeckId)) {
      handleDragEnd();
      return;
    }

    try {
      // Move the dragged deck to be a child of the target deck
      await moveDeck({ id: draggedDeckId, parentId: targetDeckId });
    } catch (error) {
      console.error("Failed to move deck:", error);
    } finally {
      handleDragEnd();
    }
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Clear drag over if we're not over a specific deck
    if (e.target === containerRef.current) {
      setDragOverDeck(null);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // If dropped directly on the container (not on a specific deck), do nothing
    if (e.target === containerRef.current || !dragOverDeck) {
      handleDragEnd();
      return;
    }
  };

  // Header drag handlers
  const handleHeaderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverHeader(true);
    setDragOverDeck(null); // Clear deck drag over when over header
  };

  const handleHeaderDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setDragOverHeader(false);
    }
  };

  const handleHeaderDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const draggedDeckId = e.dataTransfer.getData("text/plain");
    if (!draggedDeckId) {
      return;
    }

    try {
      // Move the dragged deck to root level (parentId: null)
      await moveDeck({ id: draggedDeckId, parentId: null });
    } catch (error) {
      console.error("Failed to move deck to root:", error);
    } finally {
      handleDragEnd();
    }
  };

  return (
    <div className="max-w-lg w-full h-fit max-h-full border rounded-md bg-background flex flex-col overflow-hidden text-base min-h-20">
      <DecksHeader
        isPending={isPending}
        isError={isError}
        allDecks={allDecks || []}
        dragOverHeader={dragOverHeader}
        onDragOver={handleHeaderDragOver}
        onDragLeave={handleHeaderDragLeave}
        onDrop={handleHeaderDrop}
      />

      {/* Decks list */}
      {isPending && (
        <div className="px-2 py-1 text-muted-foreground text-sm">
          {/* TODO: @loading */}
        </div>
      )}

      {isError && (
        <div className="px-2 py-1 text-sm text-destructive">
          Could not load decks
        </div>
      )}

      {!isPending && !isError && (
        <div
          ref={containerRef}
          className="flex flex-col overflow-y-auto relative"
          onDragOver={handleContainerDragOver}
          onDrop={handleContainerDrop}
        >
          {decks.length === 0 && (
            <div className="py-5">
              <NonIdealState
                title="No decks"
                description="Create a new deck to get started"
              />
            </div>
          )}
          {decks.map((deck) => (
            <div key={deck.id}>
              <DeckRow
                deck={deck}
                expanded={expanded}
                draggedDeck={draggedDeck}
                dragOverDeck={dragOverDeck}
                isDragging={isDragging}
                descendants={descendants}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onToggleExpanded={toggleExpanded}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
