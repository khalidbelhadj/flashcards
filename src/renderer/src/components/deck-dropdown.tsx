import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Deck } from "@/lib/utils";
import { useResetDeckHistory } from "@/queries/card-queries";
import {
  IconArrowsMove,
  IconCopy,
  IconEdit,
  IconPlus,
  IconRefresh,
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
  children,
  align = "end",
}: {
  deck: Deck;
  setDialogue: (dialogue: DeckDialogue) => void;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  const { mutateAsync: resetDeckHistory } = useResetDeckHistory();

  const handleResetDeckHistory = async () => {
    await resetDeckHistory(deck.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              setDialogue({ type: "new", id: deck.id });
            }}
          >
            <IconPlus className="size-icon" />
            New deck
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              navigator.clipboard.writeText(deck.id);
            }}
          >
            <IconCopy className="size-icon" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleResetDeckHistory}>
            <IconRefresh className="size-icon" />
            Reset history
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => {
              setDialogue({
                type: "move",
                id: deck.id,
                parentId: deck.parentId,
              });
            }}
          >
            <IconArrowsMove className="size-icon" />
            Move to
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setDialogue({ type: "rename", id: deck.id, name: deck.name });
            }}
          >
            <IconEdit className="size-icon" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async () => {
              setDialogue({ type: "delete", id: deck.id });
            }}
          >
            <IconTrash className="size-icon" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
