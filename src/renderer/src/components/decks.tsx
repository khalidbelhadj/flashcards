import DeckDropdown, { DeckDialogue } from "@/components/deck-dropdown";
import DeleteDeckDialog from "@/components/delete-deck-dialog";
import MoveDeckDialog from "@/components/move-deck-dialog";
import NewDeckDialog from "@/components/new-deck-dialog";
import NonIdealState from "@/components/non-ideal-state";
import ProjectIcon from "@/components/project-icon";
import RenameDeckDialogue from "@/components/rename-deck-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildTree, cn, flatten } from "@/lib/utils";
import { useDecksRecursive, useMoveDeck } from "@/queries/deck-queries";
import { IconChevronRight, IconDots, IconPlus } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { NavLink } from "react-router";

export default function Decks() {
  const [dialogue, setDialogue] = useState<DeckDialogue | null>(null);
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
    if (!draggedDeck) return new Set();
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
    <div className="max-w-lg w-full h-fit max-h-full border rounded-md bg-background flex flex-col overflow-hidden">
      {dialogue && (
        <>
          {dialogue.type === "move" && (
            <MoveDeckDialog
              open={dialogue.type === "move"}
              onClose={() => setDialogue(null)}
              id={dialogue.id}
              parentId={dialogue.parentId}
            />
          )}
          {dialogue.type === "rename" && (
            <RenameDeckDialogue
              open={dialogue.type === "rename"}
              onClose={() => setDialogue(null)}
              id={dialogue.id}
              name={dialogue.name}
            />
          )}
          {dialogue.type === "new" && (
            <NewDeckDialog
              id={dialogue.id}
              open={dialogue.type === "new"}
              onClose={() => setDialogue(null)}
            />
          )}
          {dialogue.type === "delete" && (
            <DeleteDeckDialog
              id={dialogue.id}
              open={dialogue.type === "delete"}
              onClose={() => setDialogue(null)}
            />
          )}
        </>
      )}

      {/* Header */}
      <div
        className={cn(
          "px-2 py-1 pr-1 gap-1 border-b flex items-center justify-between transition-colors",
          dragOverHeader && "bg-blue-100 dark:bg-blue-900/30",
        )}
        onDragOver={handleHeaderDragOver}
        onDragLeave={handleHeaderDragLeave}
        onDrop={handleHeaderDrop}
      >
        <div className="font-medium text-sm text-muted-foreground flex items-center gap-2">
          Decks
          {!isPending && !isError && (
            <Tooltip>
              <TooltipTrigger>
                <div className="bg-muted w-fit px-1 rounded-sm text-xs">
                  {allDecks.length}
                </div>
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
                setDialogue({ type: "new", id: null });
              }}
              icon={<IconPlus className="text-muted-foreground" />}
            />
          </TooltipTrigger>
          <TooltipContent>Create a new deck</TooltipContent>
        </Tooltip>
      </div>

      {/* Decks list */}
      {isPending && (
        <div className="px-2 py-1 text-muted-foreground text-sm">Loading</div>
      )}

      {isError && (
        <div className="px-2 py-1 text-sm text-destructive">
          Could not load decks
        </div>
      )}

      {!isPending && !isError && (
        <div
          ref={containerRef}
          className="flex flex-col overflow-y-auto flex-1 relative"
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
          <AnimatePresence initial={false}>
            {decks.map((deck) => (
              <motion.div
                key={deck.id}
                initial={{ height: 0 }}
                animate={{
                  height: "auto",
                }}
                exit={{
                  height: 0,
                }}
                transition={{ duration: 0.15 }}
                style={{ overflow: "hidden" }}
              >
                <NavLink
                  key={deck.id}
                  to={`/decks/${deck.id}`}
                  draggable
                  className={cn(
                    "flex items-center gap-0.5 p-1 hover:bg-accent font-medium relative group",
                    draggedDeck === deck.id && "opacity-50",
                    dragOverDeck === deck.id &&
                      "bg-blue-100 dark:bg-blue-900/30",
                    isDragging && draggedDeck === deck.id && "cursor-grabbing",
                    // Disable drop styling for descendants
                    draggedDeck &&
                      descendants.has(deck.id) &&
                      "cursor-not-allowed opacity-50",
                  )}
                  onDragStart={(e) => handleDragStart(e, deck.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, deck.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, deck.id)}
                >
                  {Array.from({ length: deck.depth }).map(() => (
                    <div className="w-6"></div>
                  ))}
                  <Button
                    className="hover:bg-muted !p-0"
                    size="icon-sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (deck.childCount === 0) return;
                      toggleExpanded(deck.id);
                    }}
                  >
                    <ProjectIcon className="size-icon group-hover:hidden" />
                    <IconChevronRight
                      className={cn(
                        "size-icon hidden group-hover:inline-block transition-transform",
                        deck.childCount === 0 && "text-muted-foreground",
                        expanded.has(deck.id) &&
                          deck.childCount > 0 &&
                          "rotate-90",
                      )}
                    />
                  </Button>

                  <div className="flex-1 text-sm">{deck.name}</div>
                  <DeckDropdown deck={deck} setDialogue={setDialogue}>
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
