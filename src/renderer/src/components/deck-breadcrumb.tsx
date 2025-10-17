import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { prefetchDeck } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router";
import { DecksRow } from "src/lib/schema";

type DeckBreadcrumbProps = {
  path: DecksRow[];
  deckId: string;
};

export function DeckBreadcrumb({ path, deckId }: DeckBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <NavLink to={`/`}>Decks</NavLink>
        </BreadcrumbItem>
        {path.length <= 3 ? (
          path.map((p) => (
            <DeckBreadcrumbItem key={p.id} deck={p} deckId={deckId} />
          ))
        ) : (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    {path.slice(0, path.length - 2).map((deck) => (
                      <DropdownMenuItem key={deck.id} asChild>
                        <NavLink to={`/decks/${deck.id}`}>{deck.name}</NavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            {path.slice(-2).map((p) => (
              <DeckBreadcrumbItem key={p.id} deck={p} deckId={deckId} />
            ))}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function DeckBreadcrumbItem({
  deck,
  deckId,
}: {
  deck: DecksRow;
  deckId: string;
}) {
  const queryClient = useQueryClient();
  return (
    <>
      <BreadcrumbSeparator />
      {deck.id === deckId ? (
        <BreadcrumbPage>
          <NavLink to={`/decks/${deck.id}`}>{deck.name}</NavLink>
        </BreadcrumbPage>
      ) : (
        <BreadcrumbItem onMouseOver={() => prefetchDeck(deck.id, queryClient)}>
          <NavLink to={`/decks/${deck.id}`}>{deck.name}</NavLink>
        </BreadcrumbItem>
      )}
    </>
  );
}
