import ProjectIcon from "@/components/project-icon";
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
import { Input } from "@/components/ui/input";
import { cn, displayName } from "@/lib/utils";
import {
  IconChevronDown,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useDeckPath, useDecks } from "../queries/deck-queries";
import NonIdealState from "./non-ideal-state";
import { Button } from "./ui/button";
import { DecksRow } from "src/lib/schema";

interface DeckPickerProps {
  id: string | null;
  setId: (id: string | null) => void;
  disabled?: string[];
  collapsible?: boolean;
}

export function DeckPicker({
  id,
  setId,
  disabled,
  collapsible = false,
}: DeckPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: decks } = useDecks(id);
  const { data: path } = useDeckPath(id);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          className="flex-1 justify-start"
          onClick={() => setExpanded(!expanded)}
        >
          <ProjectIcon className="size-3.5" />
          {path?.at(-1)?.name ?? "Decks"}
          {collapsible && (
            <IconChevronDown
              className={cn(
                "size-4 ml-auto transition-transform",
                expanded && "rotate-180",
              )}
            />
          )}
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {(expanded || !collapsible) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className="border rounded-md overflow-hidden"
          >
            <Input
              icon={<IconSearch className="size-4" />}
              placeholder="Search"
              className="rounded-b-none border-none !ring-0 !outline-0 !border-0 shadow-none"
              autoFocus
            />
            <div className="p-1 bg-background-dark border-b border-t">
              <PickerBreadcrumb path={path ?? []} onNavigate={setId} />
            </div>
            <div className="flex flex-col h-48 overflow-auto">
              {decks?.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <NonIdealState
                    title="No decks"
                    description="No decks found in this location"
                  />
                </div>
              )}
              {decks?.map((deck) => (
                <div className=" flex items-center" key={deck.id}>
                  <Button
                    onClick={() => setId(deck.id)}
                    className="justify-start flex-1 !rounded-none px-2"
                    variant="ghost"
                    disabled={disabled?.includes(deck.id)}
                  >
                    <ProjectIcon className="size-3.5" />
                    {displayName(deck.name)}
                    <IconChevronRight className="size-3.5 ml-auto" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PickerBreadcrumb({
  path,
  onNavigate,
}: {
  path: DecksRow[];
  onNavigate: (id: string | null) => void;
}) {
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
    const gap = 6;

    const segmentWidths: number[] = [];
    for (const seg of segments) {
      segmentWidths.push(seg.offsetWidth + gap);
    }

    const totalWidth = decksWidth + segmentWidths.reduce((a, b) => a + b, 0);
    if (totalWidth <= availableWidth) {
      setCollapseCount(0);
      return;
    }

    const reserved = decksWidth + ellipsisWidth + gap * 2;
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
    <div ref={containerRef} className="min-w-0 w-full relative">
      {/* Hidden measurement row */}
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
          <BreadcrumbItem className="shrink-0 cursor-pointer" onClick={() => onNavigate(null)}>
            Decks
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
                        <DropdownMenuItem key={deck.id} onClick={() => onNavigate(deck.id)}>
                          {displayName(deck.name)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}

          {visibleItems.map((p, i) => (
            <span key={p.id} className="contents">
              <BreadcrumbSeparator className="shrink-0" />
              {i === visibleItems.length - 1 ? (
                <BreadcrumbPage className="shrink-0 truncate max-w-48">
                  {displayName(p.name)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbItem
                  className="shrink-0 cursor-pointer"
                  onClick={() => onNavigate(p.id)}
                >
                  {displayName(p.name)}
                </BreadcrumbItem>
              )}
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

