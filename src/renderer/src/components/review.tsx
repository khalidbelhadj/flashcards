import { useDueCards } from "@/queries/card-queries";
import { useDeck, useDeckPath } from "@/queries/deck-queries";
import { useCreateReview } from "@/queries/review-queries";
import { IconAlignLeft, IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { NavLink, useParams } from "react-router";
import { Button } from "./ui/button";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckBreadcrumb } from "./deck-breadcrumb";

export function Review() {
  const { id } = useParams<{ id: string }>();

  const [show, setShow] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);

  const { data: deck } = useDeck(id ?? "");
  const deckId = id ?? null;

  const { data: due } = useDueCards(deckId);
  const { data: path, isPending, isError } = useDeckPath(id ?? "");

  const { mutateAsync: createReview } = useCreateReview();

  if (due === undefined || (id && deck === undefined)) {
    // TODO: @loading
    return <div>Loading...</div>;
  }

  const handleNext = () => {
    setCardIdx((prev) => Math.min(prev + 1, due.length));
  };

  const handleRate = async (rating: "forgot" | "hard" | "good" | "easy") => {
    const card = due[cardIdx];
    if (card) {
      await createReview({
        deckId: card.deckId ?? id ?? "",
        cardId: card.id,
        rating,
      });
    }
    handleNext();
    setShow(false);
  };

  const card = due[cardIdx];

  return (
    <div className="w-full h-full relative">
      <header className="flex items-center p-2 gap-2 pl-20 relative">
        <Button
          className=""
          size="sm"
          variant="outline"
          asChild
          icon={<IconArrowLeft className="size-4" />}
        >
          <NavLink to={id ? `/decks/${id}` : `/`}>Exit</NavLink>
        </Button>
        <div className="absolute left-1/2 -translate-x-1/2 max-w-[60%]">
          {!id && (
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

          {id && isError && (
            <div className="text-destructive">Could not get path</div>
          )}

          {id && isPending && <Skeleton className="h-5 w-24" />}

          {id && !isPending && !isError && (
            <DeckBreadcrumb path={path} deckId={id} />
          )}
        </div>
      </header>

      {due.length > 0 && (
        <div className="flex items-center justify-center p-4 flex-col">
          <div className="text-muted-foreground">
            {cardIdx + 1} / {due.length}
          </div>
          <div className="w-96 bg-neutral-200 border border-neutral-300 h-5 rounded-full overflow-clip">
            <div
              className="bg-success h-full transition-all ease-in-out duration-300"
              style={{
                width: `${(cardIdx / due.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
      {/* <input
        type="range"
        step={1}
        min={0}
        max={maxProgress}
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex items-center justify-center p-4">
        <Button
          onClick={() => {
            setProgress((p) => Math.max(p - 1, 0));
          }}
        >
          -
        </Button>
        <Button
          onClick={() => {
            setProgress((p) => Math.min(p + 1, maxProgress));
          }}
        >
          +
        </Button>
      </div> */}

      <main className="w-lg mx-auto pt-16 px-5 ">
        {cardIdx >= due.length && (
          <div className="flex flex-col items-center">
            <div className="text-muted-foreground text-center p-4">
              No cards to review
            </div>
            <Button asChild>
              <NavLink to={id ? `/decks/${id}` : `/`}>Back to {id ? "deck" : "decks"}</NavLink>
            </Button>
          </div>
        )}
        {cardIdx < due.length && (
          <>
            <div className="border rounded-md max-w-lg bg-background overflow-hidden">
              <div className="p-2 flex flex-col gap-1">
                <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
                  <IconAlignLeft className="size-3" />
                  Front
                </div>
                {card.front.length > 0 ? (
                  <span className="font-content">{card.front}</span>
                ) : (
                  <span className="text-muted-foreground">Empty</span>
                )}
              </div>
              {show && (
                <div className="p-2 flex flex-col gap-1  border-t border-dashed ">
                  <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
                    <IconAlignLeft className="size-3" />
                    Back
                  </div>
                  {card.back.length > 0 ? (
                    <span className="font-content">{card.back}</span>
                  ) : (
                    <span className="text-muted-foreground">Empty</span>
                  )}
                </div>
              )}
            </div>

            {/* <div className="bg-background rounded-md border p-2">
              <div>{card.front}</div>
              {show && (
                <>
                  <div className=" border-t border-dashed">{card.back}</div>
                </>
              )}
            </div> */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2">
              {!show && <Button onClick={() => setShow(true)}>Show</Button>}
              {show && (
                <div className="flex flex-col gap-1">
                  <Button onClick={() => setShow(false)}>Hide Answer</Button>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => handleRate("forgot")}>Forgot</Button>
                    <Button onClick={() => handleRate("hard")}>Hard</Button>
                    <Button onClick={() => handleRate("good")}>Good</Button>
                    <Button onClick={() => handleRate("easy")}>Easy</Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
