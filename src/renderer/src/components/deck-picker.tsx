import ProjectIcon from "@/components/project-icon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useDeckPath, useDecks } from "../queries/deck-queries";
import NonIdealState from "./non-ideal-state";
import { Button } from "./ui/button";

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
            <Breadcrumb className="p-1 bg-background-dark border-b border-t">
              <BreadcrumbList>
                <BreadcrumbItem
                  onClick={() => setId(null)}
                  className="cursor-pointer"
                >
                  Decks
                </BreadcrumbItem>
                {path?.map((p) => (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem
                      key={p.id}
                      onClick={() => setId(p.id)}
                      className="cursor-pointer"
                    >
                      {p.name}
                    </BreadcrumbItem>
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
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
                <div className=" flex items-center">
                  <Button
                    // variant="link"
                    key={deck.id}
                    onClick={() => setId(deck.id)}
                    className="justify-start flex-1 !rounded-none px-2"
                    variant="ghost"
                    disabled={disabled?.includes(deck.id)}
                  >
                    <ProjectIcon className="size-3.5" />
                    {deck.name}
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
