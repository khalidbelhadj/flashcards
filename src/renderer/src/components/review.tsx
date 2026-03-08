import { useCramCards, useDueCards, useNewCards } from "@/queries/card-queries";
import { useDeck, useDeckPath } from "@/queries/deck-queries";
import { useCreateReview } from "@/queries/review-queries";
import { IconArrowLeft, IconEyeOff, IconPlayerSkipForward } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useDebugMode, ReviewDebugInfo, ReviewDebugSheet } from "./review-debug";
import { NavLink, useParams, useSearchParams } from "react-router";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";


import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckBreadcrumb } from "./deck-breadcrumb";
import NonIdealState from "./non-ideal-state";

export type ReviewMode = "due" | "cram" | "new";

function parseReviewMode(value: string | null): ReviewMode {
  if (value === "cram" || value === "new") return value;
  return "due";
}

function useReviewCards(deckId: string | undefined, mode: ReviewMode) {
  const due = useDueCards(deckId ?? null);
  const cram = useCramCards(mode === "cram" ? (deckId ?? null) : null);
  const newCards = useNewCards(mode === "new" ? (deckId ?? null) : null);

  if (mode === "cram") return cram;
  if (mode === "new") return newCards;
  return due;
}

export function Review() {
  const { id: deckId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = parseReviewMode(searchParams.get("mode"));

  const [show, setShow] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const debugMode = useDebugMode();

  const { data: deck } = useDeck(deckId ?? "");
  const { data: cards } = useReviewCards(deckId, mode);
  const { data: path, isPending, isError } = useDeckPath(deckId ?? "");
  const { mutateAsync: createReview } = useCreateReview();

  const snapshotRef = useRef(cards);

  // Freeze the queue on first load
  if (snapshotRef.current === undefined && cards !== undefined) {
    snapshotRef.current = cards;
  }
  const queue = snapshotRef.current;

  const handleNext = () => {
    setCardIdx((prev) => Math.min(prev + 1, queue?.length ?? 0));
  };

  const handleRate = async (rating: "forgot" | "hard" | "good" | "easy") => {
    if (!queue) return;
    const card = queue[cardIdx];
    if (card) {
      await createReview({
        deckId: card.deckId,
        cardId: card.id,
        rating,
      });
    }
    handleNext();
    setShow(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === " " && queue && cardIdx < queue.length) {
        e.preventDefault();
        setShow((prev) => !prev);
      }

      if (show) {
        if (e.key === "1") handleRate("forgot");
        else if (e.key === "2") handleRate("hard");
        else if (e.key === "3") handleRate("good");
        else if (e.key === "4") handleRate("easy");
      }

      if (e.key === "?") {
        setShowHelp((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, cardIdx, queue]);

  if (queue === undefined || (deckId && deck === undefined)) {
    return <div>Loading...</div>;
  }

  if (cards === undefined) {
    return <div>Loading...</div>;
  }

  const card = queue[cardIdx];

  return (
    <div className="w-full h-full relative">
      <header id="desktop-header" className="flex items-center p-2 gap-2 pl-20 relative">
        <Button
          className=""
          size="sm"
          variant="ghost"
          asChild
          icon={<IconArrowLeft className="size-4" />}
        >
          <NavLink to={deckId ? `/decks/${deckId}` : `/`}>Exit</NavLink>
        </Button>
        <div className="absolute left-1/2 -translate-x-1/2 max-w-[60%]">
          {!deckId && (
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <NavLink to="/">Decks</NavLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="text-foreground">
                  All cards
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {deckId && isError && (
            <div className="text-destructive">Could not get path</div>
          )}

          {deckId && isPending && <Skeleton className="h-5 w-24" />}

          {deckId && !isPending && !isError && (
            <DeckBreadcrumb path={path} deckId={deckId} />
          )}
        </div>
      </header>

      {queue.length > 0 && (
        <div className="px-4 py-2 max-w-lg mx-auto">
          <div className="bg-muted border rounded-full h-5 overflow-clip">
            <div
              className="bg-primary h-full transition-all ease-in-out duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)]"
              style={{
                width: `${(cardIdx / queue.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      <main className="w-lg mx-auto pt-16 px-5 ">
        {cardIdx >= queue.length && (
          <div className="flex flex-col items-center gap-3">
            <NonIdealState
              title="No cards to review"
              description="You're all caught up!"
            />
            <Button asChild>
              <NavLink to={deckId ? `/decks/${deckId}` : `/`}>
                Back to {deckId ? "deck" : "decks"}
              </NavLink>
            </Button>
          </div>
        )}
        {cardIdx < queue.length && (
          <>
            <div className="border rounded-md max-w-lg bg-background overflow-hidden">
              <div className="p-2 flex flex-col gap-1">
                <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
                  Front
                </div>
                {card.front.length > 0 ? (
                  <div className="whitespace-pre-wrap break-words font-content">
                    {card.front}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Empty</span>
                )}
              </div>
              {show && (
                <div className="p-2 flex flex-col gap-1 border-t border-dashed">
                  <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
                    Back
                  </div>
                  {card.back.length > 0 ? (
                    <div className="whitespace-pre-wrap break-words font-content">
                      {card.back}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Empty</span>
                  )}
                </div>
              )}
            </div>

            {debugMode && (
              <div className="max-w-lg flex items-start">
                <ReviewDebugInfo card={card} />
                <ReviewDebugSheet
                  card={card}
                  queuePosition={cardIdx}
                  queueTotal={queue.length}
                />
              </div>
            )}

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-4">
              {!show && (
                <Button variant="outline" onClick={() => setShow(true)}>
                  Show Answer
                </Button>
              )}
              {show && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setShow(false)} title="Hide answer">
                    <IconEyeOff className="size-4 text-muted-foreground/50" />
                  </Button>
                  <ButtonGroup>
                    <Button variant="outline" onClick={() => handleRate("forgot")}>
                      Forgot
                    </Button>
                    <Button variant="outline" onClick={() => handleRate("hard")}>
                      Hard
                    </Button>
                    <Button variant="outline" onClick={() => handleRate("good")}>
                      Good
                    </Button>
                    <Button variant="outline" onClick={() => handleRate("easy")}>
                      Easy
                    </Button>
                  </ButtonGroup>
                  <Button variant="ghost" size="icon" onClick={() => { handleNext(); setShow(false); }} title="Skip">
                    <IconPlayerSkipForward className="size-4 text-muted-foreground/50" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {queue.length > 0 && cardIdx < queue.length && (
        <div className="absolute bottom-0 right-0 p-3 text-xs text-muted-foreground">
          {cardIdx + 1} / {queue.length} ({Math.round((cardIdx / queue.length) * 100)}%)
        </div>
      )}

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <kbd className="px-2 py-0.5 rounded border bg-muted font-mono text-xs">Space</kbd>
            <span>Show / hide answer</span>
            <kbd className="px-2 py-0.5 rounded border bg-muted font-mono text-xs">1</kbd>
            <span>Forgot</span>
            <kbd className="px-2 py-0.5 rounded border bg-muted font-mono text-xs">2</kbd>
            <span>Hard</span>
            <kbd className="px-2 py-0.5 rounded border bg-muted font-mono text-xs">3</kbd>
            <span>Good</span>
            <kbd className="px-2 py-0.5 rounded border bg-muted font-mono text-xs">4</kbd>
            <span>Easy</span>
            <kbd className="px-2 py-0.5 rounded border bg-muted font-mono text-xs">?</kbd>
            <span>Toggle this dialog</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
