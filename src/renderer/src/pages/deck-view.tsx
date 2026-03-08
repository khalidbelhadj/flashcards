import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  IconCards,

  IconLoader,
  IconMenu2,
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { useDeck, useDecks, useDeckPath } from "@/queries/deck-queries";
import { useCards } from "@/queries/card-queries";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export default function DeckView() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: deck, isPending: isDeckPending, isError: isDeckError } = useDeck(deckId!);
  const { data: subDecks } = useDecks(deckId!);
  const { data: cards, isPending: isCardsPending } = useCards(deckId!, search || undefined);
  const { data: path } = useDeckPath(deckId!);

  if (isDeckPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <IconLoader className="size-5 animate-spin" />
      </div>
    );
  }

  if (isDeckError) {
    return (
      <div className="flex h-screen items-center justify-center text-destructive text-sm font-medium">
        Error loading deck
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Breadcrumb bar */}
      <header className="h-10 border-b flex items-center justify-center px-4 shrink-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer"
                onClick={() => navigate("/")}
              >
                Decks
              </BreadcrumbLink>
            </BreadcrumbItem>
            {path && path.length > 1 &&
              path.slice(0, -1).map((p) => (
                <span key={p.id} className="contents">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="cursor-pointer"
                      onClick={() => navigate(`/deck/${p.id}`)}
                    >
                      {p.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </span>
              ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{deck.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-4 pb-2 space-y-3 shrink-0">
          {/* Deck title + actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <IconCards className="size-5 text-muted-foreground shrink-0" />
                <h1 className="text-lg font-semibold">{deck.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {deck.cardCount === 0
                  ? "No cards yet"
                  : deck.lastReview
                    ? `Last reviewed ${new Date(deck.lastReview).toLocaleDateString()}`
                    : "No reviews yet"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm">
                <IconPlus data-icon="inline-start" /> New deck
              </Button>
              <Button size="sm">
                <IconRefresh data-icon="inline-start" /> Review
              </Button>
            </div>
          </div>

          {/* Sub-decks */}
          {subDecks && subDecks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subDecks.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/deck/${sub.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
                >
                  <IconCards className="size-3.5 text-muted-foreground" />
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search bar + count + new card */}
        <div className="flex items-center gap-3 px-4 py-2 border-t shrink-0">
          <InputGroup className="max-w-48">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <IconSearch />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <span className="text-xs text-muted-foreground tabular-nums bg-muted border rounded-md px-2 py-0.5">
            {cards?.length ?? 0}
          </span>
          <div className="ml-auto shrink-0">
            <Button variant="outline" size="sm">
              <IconPlus data-icon="inline-start" /> New card
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="px-4 py-2 flex-1 overflow-y-auto min-h-0">
          <div className="max-w-lg mx-auto space-y-3">
          {isCardsPending ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader className="size-4 animate-spin" />
            </div>
          ) : cards && cards.length > 0 ? (
            cards.map((card) => (
              <div key={card.id} className="rounded-lg border overflow-hidden">
                {/* Front */}
                <div className="px-3 pt-2 pb-3">
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground border rounded px-1.5 py-0.5 mb-1.5">
                    <IconMenu2 className="size-3" />
                    Front
                  </div>
                  <p className="text-sm">{card.front}</p>
                </div>

                {/* Back */}
                <div className="px-3 pt-2 pb-3 border-t border-dashed">
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground border rounded px-1.5 py-0.5 mb-1.5">
                    <IconMenu2 className="size-3" />
                    Back
                  </div>
                  <p className="text-sm">{card.back}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
                  <span>Basic</span>
                  <span>{card.n > 0 ? `${card.n} reviews` : "No reviews"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No cards yet
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
