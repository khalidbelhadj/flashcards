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
import { displayName, prefetchDeck } from "@/lib/utils";
import { IconChevronRight } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useRef, useState, useCallback } from "react";
import { NavLink } from "react-router";
import { DecksRow } from "src/lib/schema";

type DeckBreadcrumbProps = {
  path: DecksRow[];
  deckId: string;
};

export function DeckBreadcrumb({ path, deckId }: DeckBreadcrumbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [collapseCount, setCollapseCount] = useState(0);

  const calculate = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const availableWidth = container.clientWidth;
    const segments = measure.querySelectorAll<HTMLElement>("[data-measure-segment]");
    const decksEl = measure.querySelector<HTMLElement>("[data-measure-decks]");
    const ellipsisEl = measure.querySelector<HTMLElement>("[data-measure-ellipsis]");

    if (!decksEl || !ellipsisEl) return;

    const decksWidth = decksEl.offsetWidth;
    const ellipsisWidth = ellipsisEl.offsetWidth;
    const gap = 6; // gap-1.5 = 6px

    // Get each segment's width (separator + item)
    const segmentWidths: number[] = [];
    for (const seg of segments) {
      segmentWidths.push(seg.offsetWidth + gap);
    }

    // Try showing all items (no collapse)
    const totalWidth = decksWidth + segmentWidths.reduce((a, b) => a + b, 0);
    if (totalWidth <= availableWidth) {
      setCollapseCount(0);
      return;
    }

    // Need to collapse. Reserve space for Decks + ellipsis
    const reserved = decksWidth + ellipsisWidth + gap * 2;

    // Add items from right until we run out of space, always show at least 1
    let rightWidth = 0;
    let visibleFromRight = 0;
    for (let i = segmentWidths.length - 1; i >= 0; i--) {
      if (reserved + rightWidth + segmentWidths[i] <= availableWidth) {
        rightWidth += segmentWidths[i];
        visibleFromRight++;
      } else {
        break;
      }
    }

    visibleFromRight = Math.max(1, visibleFromRight);
    setCollapseCount(path.length - visibleFromRight);
  }, [path]);

  // Calculate on mount, path change, and resize
  useLayoutEffect(() => {
    calculate();
  }, [calculate]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => calculate());
    observer.observe(container);
    return () => observer.disconnect();
  }, [calculate]);

  const hiddenItems = path.slice(0, collapseCount);
  const visibleItems = path.slice(collapseCount);

  return (
    <div ref={containerRef} className="min-w-0 w-full relative flex justify-center">
      {/* Hidden measurement row - always renders all items to measure widths */}
      <div
        ref={measureRef}
        aria-hidden
        className="flex items-center gap-1.5 text-sm absolute top-0 left-0 invisible pointer-events-none whitespace-nowrap"
      >
        <span data-measure-decks className="inline-flex items-center">Decks</span>
        <span data-measure-ellipsis className="inline-flex items-center gap-1.5">
          <IconChevronRight className="size-3.5" />
          <span className="flex size-5 items-center justify-center">…</span>
        </span>
        {path.map((p) => (
          <span key={p.id} data-measure-segment className="inline-flex items-center gap-1.5">
            <IconChevronRight className="size-3.5" />
            <span>{displayName(p.name)}</span>
          </span>
        ))}
      </div>

      {/* Visible breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="shrink-0">
            <NavLink to="/">Decks</NavLink>
          </BreadcrumbItem>

          {hiddenItems.length > 0 && (
            <>
              <BreadcrumbSeparator className="shrink-0" />
              <BreadcrumbItem className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex size-6 items-center justify-center cursor-pointer rounded-sm hover:bg-muted transition-colors">
                      <BreadcrumbEllipsis />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuGroup>
                      {hiddenItems.map((deck) => (
                        <DropdownMenuItem key={deck.id} asChild>
                          <NavLink to={`/decks/${deck.id}`}>{displayName(deck.name)}</NavLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}

          {visibleItems.map((p) => (
            <DeckBreadcrumbItem key={p.id} deck={p} deckId={deckId} />
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
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
      <BreadcrumbSeparator className="shrink-0" />
      {deck.id === deckId ? (
        <BreadcrumbPage className="shrink-0 truncate max-w-48">
          <NavLink to={`/decks/${deck.id}`}>{displayName(deck.name)}</NavLink>
        </BreadcrumbPage>
      ) : (
        <BreadcrumbItem
          className="shrink-0"
          onMouseOver={() => prefetchDeck(deck.id, queryClient)}
        >
          <NavLink to={`/decks/${deck.id}`}>{displayName(deck.name)}</NavLink>
        </BreadcrumbItem>
      )}
    </>
  );
}
