import { NavLink, useParams } from "react-router";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeck, useDeckPath } from "@/queries/deck-queries";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeckHeader({ id }: { id: string }) {
  const { data: path, isPending, isError } = useDeckPath(id);

  if (path?.length === 0) {
    throw new Error("TODO");
  }

  return (
    <header className="flex items-center p-2 gap-2 pl-20 bg-background">
      <Breadcrumb>
        <BreadcrumbList>
          {isError && (
            <div className="text-destructive">Could not get path</div>
          )}

          {isPending && <Skeleton className="h-5 w-24" />}

          {!isPending && !isError && (
            <>
              <BreadcrumbItem>
                <NavLink to={`/`}>Decks</NavLink>
              </BreadcrumbItem>
              {path.length <= 3 &&
                path.map((p) => (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem
                      className={cn("", p.id === id && "text-foreground")}
                    >
                      <NavLink to={`/decks/${p.id}`}>{p.name}</NavLink>
                    </BreadcrumbItem>
                  </>
                ))}

              {path.length > 3 && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem key={id}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <BreadcrumbEllipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuGroup>
                          {path.slice(0, path.length - 2).map((deck) => (
                            <DropdownMenuItem key={deck.id} asChild>
                              <NavLink to={`/decks/${deck.id}`}>
                                {deck.name}
                              </NavLink>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>

                  {path.slice(-2).map((p) => (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem
                        className={cn("", p.id === id && "text-foreground")}
                      >
                        <NavLink to={`/decks/${p.id}`}>{p.name}</NavLink>
                      </BreadcrumbItem>
                    </>
                  ))}
                </>
              )}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
