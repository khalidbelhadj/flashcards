import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeckDialogue } from "@/contexts/deck-dialogue-context";
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

export default function DeckDropdown({
  deck,
  children,
  align = "end",
}: {
  deck: Deck;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  const { mutateAsync: resetDeckHistory } = useResetDeckHistory();
  const { openDialogue } = useDeckDialogue();

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
              openDialogue({ type: "new", id: deck.id });
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
              openDialogue({
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
              openDialogue({ type: "rename", id: deck.id, name: deck.name });
            }}
          >
            <IconEdit className="size-icon" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async () => {
              openDialogue({ type: "delete", id: deck.id });
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
