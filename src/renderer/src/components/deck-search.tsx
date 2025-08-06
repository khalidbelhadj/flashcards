import NonIdealState from "@/components/non-ideal-state";
import ProjectIcon from "@/components/project-icon";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatNumber } from "@/lib/utils";
import { useAllDecks, useDeckPath } from "@/queries/deck-queries";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

interface DeckSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DeckListItemProps {
  id: string;
  name: string;
  cardCount: number;
  onClose: () => void;
}

function DeckListItem({ id, name, cardCount, onClose }: DeckListItemProps) {
  const navigate = useNavigate();
  const { data: path } = useDeckPath(id);
  const pathString = path?.map((d) => d.name).join(" / ");

  return (
    <CommandItem
      key={id}
      value={id}
      onSelect={() => {
        navigate(`/decks/${id}`);
        onClose();
      }}
      className="flex flex-col items-start gap-0 !px-2 !py-1"
    >
      <div className="flex w-full items-center gap-1">
        <div className="flex items-center gap-1 text-base font-medium min-w-0">
          <ProjectIcon className="!size-icon-sm" />
          <span className="text-sm truncate flex-1 min-w-0">{name}</span>
        </div>
        <div className="text-xs text-muted-foreground ml-auto">
          {cardCount === 0
            ? "No cards"
            : cardCount === 1
              ? "1 card"
              : `${formatNumber(cardCount)} cards`}
        </div>
      </div>
      {pathString && (
        <span className="text-xs text-muted-foreground text-nowrap w-full truncate">
          {pathString}
        </span>
      )}
    </CommandItem>
  );
}

export function DeckSearch({ open, onOpenChange }: DeckSearchProps) {
  const { data: decks } = useAllDecks();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const filteredDecks = useMemo(
    () =>
      decks?.filter((deck) =>
        deck.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [decks, search],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      showCloseButton={false}
    >
      <Command className="" shouldFilter={false}>
        <CommandInput
          placeholder="Search decks..."
          value={search}
          onValueChange={(v) => {
            console.log(v);
            setSearch(v);
          }}
          className="!p-0 !h-fit"
        />
        <CommandList className="h-[300px]">
          <CommandEmpty>
            <NonIdealState
              className="!pt-5"
              title="No decks found"
              description="No decks match your search"
            />
          </CommandEmpty>
          <CommandGroup heading="" className="!p-1">
            {filteredDecks?.map((deck) => (
              <DeckListItem
                key={deck.id}
                {...deck}
                onClose={() => onOpenChange(false)}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
