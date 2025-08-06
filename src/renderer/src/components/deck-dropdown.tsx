import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Deck } from "@/lib/utils";
import {
  IconArrowsMove,
  IconDots,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

export type DeckDialogue =
  | {
      type: "new";
      id: string | null;
    }
  | {
      type: "rename";
      id: string;
      name: string;
    }
  | {
      type: "move";
      id: string;
      parentId: string | null;
    }
  | {
      type: "delete";
      id: string;
    };

export default function DeckDropdown({
  deck,
  setDialogue,
}: {
  deck: Deck;
  setDialogue: (dialogue: DeckDialogue) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="p-1 h-full w-fit ml-auto hover:bg-muted"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              setDialogue({ type: "new", id: deck.id });
            }}
          >
            <IconPlus className="size-3.5" />
            New deck
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setDialogue({ type: "rename", id: deck.id, name: deck.name });
            }}
          >
            <IconEdit className="size-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setDialogue({
                type: "move",
                id: deck.id,
                parentId: deck.parentId,
              });
            }}
          >
            <IconArrowsMove className="size-3.5" />
            Move
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async () => {
              setDialogue({ type: "delete", id: deck.id });
            }}
          >
            <IconTrash className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
