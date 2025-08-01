import { Button } from "@/components/ui/button";
import { NavLink } from "react-router";
import {
  IconAdjustments,
  IconArrowsMove,
  IconChevronRight,
  IconCube,
  IconDots,
  IconEdit,
  IconFoldDown,
  IconFoldUp,
  IconLayoutNavbarCollapse,
  IconLayoutNavbarExpand,
  IconPlus,
  IconSettings,
  IconSettings2,
  IconSettingsCode,
  IconTrash,
} from "@tabler/icons-react";
import {
  useDecks,
  useDecksRecursive,
  useDeleteDeck,
} from "@/queries/deck-queries";
import { Badge } from "@/components/ui/badge";
import NewDeckDialog from "@/components/new-deck-dialog";
import { useEffect, useMemo, useState } from "react";
import { DecksRow } from "src/lib/schema";
import Heatmap from "@/components/heatmap";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type Deck = DecksRow & {
  new: number;
  learning: number;
  due: number;
};

type Node = Deck & { children: Node[] };

function buildTree(decks: Deck[]) {
  const map = new Map<string | null, Node>();

  for (const deck of decks) {
    map.set(deck.id, { ...deck, children: [] });
  }

  for (const deck of decks) {
    const node = map.get(deck.id);
    const parent = map.get(deck.parentId);
    if (node && parent) {
      parent.children.push(node);
    }
  }

  return Array.from(map.values()).filter((deck) => deck.parentId === null);
}

type DeckWithDepth = Deck & { depth: number };

function flatten(nodes: Node[], expanded: Set<string>) {
  const result: DeckWithDepth[] = [];
  const stack = nodes.toReversed().map((node) => ({ ...node, depth: 0 }));

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) throw new Error("Bruh");
    result.push(current);
    if (!expanded.has(current.id)) continue;
    for (const child of current.children) {
      stack.push({ ...child, depth: current.depth + 1 });
    }
  }

  return result;
}

function Decks() {
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
  const { mutateAsync: deleteDeck } = useDeleteDeck();

  const decks = useMemo(() => {
    const result =
      allDecks !== undefined ? flatten(buildTree(allDecks), expanded) : [];
    return result;
  }, [allDecks, expanded]);

  const setExpandedSaved = (newExpanded: Set<string>) => {
    console.time("l1");
    localStorage.setItem("expanded", JSON.stringify(Array.from(newExpanded)));
    console.timeEnd("l1");
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

  const expandAll = () => {
    setExpandedSaved(new Set(allDecks?.map((d) => d.id)));
  };

  const collapseAll = () => {
    setExpandedSaved(new Set());
  };

  return (
    <div className="max-w-lg w-full h-fit max-h-full overflow-clip border rounded-md bg-background flex flex-col">
      {/* Decks list header */}
      <div className="px-2 py-1 pr-1 gap-1 border-b flex items-center justify-between">
        <div className="font-medium text-sm text-muted-foreground flex items-center gap-2">
          Decks
          <div className="bg-muted w-fit px-1 rounded-md text-xs">
            {!isPending && !isError && allDecks.length}
          </div>
        </div>
        <Button
          className="size-6 ml-auto"
          size="icon"
          variant="ghost"
          onClick={expandAll}
        >
          <IconFoldDown />
        </Button>
        <Button
          className="size-6"
          size="icon"
          variant="ghost"
          onClick={collapseAll}
        >
          <IconFoldUp />
        </Button>
        <NewDeckDialog id={null}>
          <Button className="size-6" size="icon" variant="ghost">
            <IconPlus className="size-4" />
            {/* New Deck */}
          </Button>
        </NewDeckDialog>
      </div>

      {isPending && (
        <div className="px-2 py-1 text-muted-foreground text-sm">Loading</div>
      )}

      {isError && (
        <div className="px-2 py-1 text-sm text-destructive">
          Could not load decks
        </div>
      )}

      {!isPending && !isError && (
        <div className="flex flex-col overflow-auto flex-1">
          {decks.length === 0 && (
            <div className="px-2 py-1 text-muted-foreground text-sm">
              No decks
            </div>
          )}
          {decks.map((deck) => (
            <NavLink
              key={deck.id}
              to={`/decks/${deck.id}`}
              className="flex items-center gap-0.5 p-1 hover:bg-muted/75 font-medium relative group"
            >
              {Array.from({ length: deck.depth }).map(() => (
                <div className="w-6"></div>
              ))}
              <Button
                className="!p-1 size-fit"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpanded(deck.id);
                }}
              >
                <IconCube className="size-3.5 group-hover:hidden" />
                <IconChevronRight
                  className={cn(
                    "size-3.5 hidden group-hover:inline-block transition-transform",
                    expanded.has(deck.id) && "rotate-90",
                  )}
                />
              </Button>

              <div>{deck.name}</div>
              <div className="flex items-center gap-1 ml-auto">
                {deck.new > 0 && (
                  <Badge variant="secondary">{deck.new} New</Badge>
                )}
                {/* {deck.due > 0 && (
                  <Badge variant="destructive">{deck.due} Due</Badge>
                )} */}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="p-1 h-full w-fit rounded-none"
                    variant="ghost"
                    size="icon"
                  >
                    <IconDots className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <IconPlus className="size-3.5" />
                      New deck
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconArrowsMove className="size-3.5" />
                      Move
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconEdit className="size-3.5" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this deck?",
                          )
                        ) {
                          await deleteDeck(deck.id);
                        }
                      }}
                    >
                      <IconTrash className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center py-16 gap-10 overflow-clip max-h-screen">
      {/* <Heatmap /> */}
      <Decks />
    </div>
  );
}
