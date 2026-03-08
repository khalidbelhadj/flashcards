import ProjectIcon from "@/components/project-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  cn,
  Deck,
  displayName,
  formatDate,
  formatNumber,
  prefetchDeck,
} from "@/lib/utils";
import { useDueCards } from "@/queries/card-queries";
import {
  useDeck,
  useDecks,
  useRenameDeck,
  useSetLastReviewed,
} from "@/queries/deck-queries";
import {
  IconCards,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleDashed,
  IconSparkles,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import DeckDropdown from "./deck-dropdown";

function DeckTitle({ deck }: { deck: Deck }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(deck.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: renameDeck } = useRenameDeck();

  useEffect(() => {
    if (!editing) setName(deck.name);
  }, [deck.name, editing]);

  const handleSave = async () => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed !== deck.name) {
      await renameDeck({ id: deck.id, name: trimmed });
    }
  };

  const handleStartEditing = () => {
    setName(deck.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select());
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setName(deck.name);
            setEditing(false);
          }
        }}
        className="font-semibold text-md bg-transparent border border-ring rounded-md px-1.5 py-0.5 outline-none"
      />
    );
  }

  return (
    <div className="group flex items-stretch gap-0.5">
      <button
        onClick={handleStartEditing}
        className="font-semibold text-md px-1.5 py-0.5 cursor-text rounded-l-md group-hover:bg-muted transition-colors"
      >
        <span className={cn(!name.trim() && "text-muted-foreground")}>
          {displayName(name)}
        </span>
      </button>
      <DeckDropdown deck={deck} align="start">
        <button className="px-1 flex items-center rounded-r-md group-hover:bg-muted transition-colors">
          <IconChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DeckDropdown>
    </div>
  );
}

function ReviewButton({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: due } = useDueCards(id);
  const { data: deck } = useDeck(id);

  const { mutateAsync: setLastReviewed } = useSetLastReviewed(id);

  const handleReview = async () => {
    await setLastReviewed(new Date());
    navigate(`/decks/${id}/review`);
  };

  return (
    <div className="flex items-center flex-nowrap gap-0">
      <Button
        className="-mr-px rounded-r-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.1)]"
        variant="default"
        onClick={handleReview}
        icon={<IconCircleDashed />}
      >
        Review
        <Badge className="py-0 !text-xs px-1 rounded-[4.5px] bg-primary-foreground/20 text-primary-foreground">
          {formatNumber(due?.length ?? 0)}
        </Badge>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-l-none border-l border-l-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.1)]"
            variant="default"
            size="icon"
          >
            <IconChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem
                  disabled={!deck?.cardCount}
                  onClick={() => navigate(`/decks/${id}/review?mode=cram`)}
                >
                  <IconCards className="size-4" />
                  Cram all cards
                  <Badge variant="secondary" className="ml-auto">
                    {deck?.cardCount ?? 0}
                  </Badge>
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {!deck?.cardCount && (
              <TooltipContent side="left">No cards in this deck</TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem
                  disabled={!deck?.new}
                  onClick={() => navigate(`/decks/${id}/review?mode=new`)}
                >
                  <IconSparkles className="size-4" />
                  Review new only
                  <Badge variant="secondary" className="ml-auto">
                    {deck?.new ?? 0}
                  </Badge>
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {!deck?.new && (
              <TooltipContent side="left">
                No new cards to review
              </TooltipContent>
            )}
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function DeckInfo({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const {
    data: deck,
    isPending: isDeckPending,
    isError: isDeckError,
  } = useDeck(id);
  const {
    data: subDecks,
    isPending: isSubdecksPending,
    isError: isSubdecksError,
  } = useDecks(id);

  return (
    <div className="flex flex-col gap-3 bg-background z-10 shadow-[0px_2px_3px_rgba(0,0,0,0.05)] dark:shadow-[0px_2px_3px_rgba(255,255,255,0.05)]">
      <div className="w-full p-5 mx-auto flex flex-col gap-3 py-0">
        <div>
          <div className="flex items-center gap-2">
            {/* Title */}
            {!isDeckPending && !isDeckError && (
              <div className="flex items-center gap-1">
                <ProjectIcon className="size-4" />
                <DeckTitle deck={deck} />
              </div>
            )}

            {isDeckPending && <Skeleton className="h-7 w-36" />}
            {isDeckError && (
              <div className="h-7 font-medium text-destructive">
                Error: Could not get deck
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <ReviewButton id={id} />
            </div>
          </div>

          {/* Last reviewd */}
          {!isDeckPending && !isDeckError && (
            <Tooltip open={deck.lastReview === null ? false : undefined}>
              <TooltipTrigger>
                <div className="text-xs text-muted-foreground">
                  {deck.lastReview === null
                    ? "No reviews yet"
                    : `Last reviewed ${formatDate(new Date(deck.lastReview)).toLowerCase()}`}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                {deck.lastReview === null
                  ? "No reviews yet"
                  : new Date(deck.lastReview).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Subdecks list */}
        <div
          className={cn(
            "w-full h-fit flex flex-col gap-2",
            subDecks?.length !== 0 && "pb-5",
          )}
        >
          <ScrollableRow>
            {isSubdecksPending &&
              Array.from({ length: 3 }).map((_) => (
                <Skeleton className="min-w-36 w-36 px-2 h-7 rounded-md font-medium flex items-center gap-1"></Skeleton>
              ))}
            {isSubdecksError && (
              <div className="text-sm text-destructive font-medium">
                Error: Could not get subdecks
              </div>
            )}
            {!isSubdecksPending &&
              !isSubdecksError &&
              subDecks?.map((deck) => (
                <SubdeckItem key={deck.id} deck={deck as Deck} queryClient={queryClient} />
              ))}
          </ScrollableRow>
        </div>
      </div>
    </div>
  );
}

function SubdeckItem({ deck, queryClient }: { deck: Deck; queryClient: ReturnType<typeof useQueryClient> }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <Tooltip delayDuration={500} open={dropdownOpen ? false : undefined}>
      <TooltipTrigger>
        <div
          className="group/subdeck relative min-w-36 w-36 h-7 bg-background border rounded-md font-medium flex items-center hover:bg-accent"
          onMouseOver={() => prefetchDeck(deck.id, queryClient)}
        >
          <NavLink
            to={`/decks/${deck.id}`}
            className="flex items-center gap-1 px-2 h-full flex-1 min-w-0"
            prefetch="intent"
          >
            <div className="size-4 shrink-0">
              <ProjectIcon className="size-3.5" />
            </div>
            <div className="truncate text-sm">
              {displayName(deck.name)}
            </div>
          </NavLink>
          <DeckDropdown deck={deck} align="start" onOpenChange={setDropdownOpen}>
            <button
              className="absolute right-0 top-0 bottom-0 px-1 flex items-center rounded-r-md bg-background group-hover/subdeck:bg-muted border-l opacity-0 group-hover/subdeck:opacity-100 transition-all"
              onClick={(e) => e.preventDefault()}
            >
              <IconChevronDown className="size-3 text-muted-foreground" />
            </button>
          </DeckDropdown>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {displayName(deck.name)}
      </TooltipContent>
    </Tooltip>
  );
}

function ScrollableRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    const mutationObserver = new MutationObserver(checkScroll);
    mutationObserver.observe(el, { childList: true, subtree: true });
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -150 : 150,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-card from-60% to-transparent pr-4">
          <Button variant="ghost" size="icon-sm" onClick={() => scroll("left")}>
            <IconChevronLeft className="size-4" />
          </Button>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-card from-60% to-transparent pl-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => scroll("right")}
          >
            <IconChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
