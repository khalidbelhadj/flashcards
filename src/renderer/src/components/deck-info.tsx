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
import { useDeckDialogue } from "@/contexts/deck-dialogue-context";
import { cn, formatDate, formatNumber, prefetchDeck } from "@/lib/utils";
import { useDueCards } from "@/queries/card-queries";
import { useDeck, useDecks, useSetLastReviewed } from "@/queries/deck-queries";
import {
  IconCards,
  IconChevronDown,
  IconCircleDashed,
  IconPlus,
  IconSparkles,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router";

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
          <DropdownMenuItem onClick={() => navigate(`/decks/${id}/review?mode=cram`)}>
            <IconCards className="size-4" />
            Cram all cards
            <span className="ml-auto text-xs text-muted-foreground">{deck?.cardCount ?? 0}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/decks/${id}/review?mode=new`)}>
            <IconSparkles className="size-4" />
            Review new only
            <span className="ml-auto text-xs text-muted-foreground">{deck?.new ?? 0}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function DeckInfo({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { openDialogue } = useDeckDialogue();

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
                <div className="font-semibold text-md">{deck.name}</div>
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
              <Button
                variant="outline"
                onClick={() => openDialogue({ type: "new", id })}
                icon={<IconPlus />}
              >
                New deck
              </Button>
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
          <div className="flex items-center gap-2 overflow-auto">
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
                <Tooltip delayDuration={500}>
                  <TooltipTrigger>
                    <NavLink
                      to={`/decks/${deck.id}`}
                      className="min-w-36 w-36 px-2 h-7 bg-background border rounded-md font-medium flex items-center gap-1 hover:bg-accent"
                      prefetch="intent"
                      onMouseOver={() => prefetchDeck(deck.id, queryClient)}
                    >
                      <div className="size-4">
                        <ProjectIcon className="size-3.5" />
                      </div>
                      <div className="truncate text-sm">{deck.name}</div>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{deck.name}</TooltipContent>
                </Tooltip>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
