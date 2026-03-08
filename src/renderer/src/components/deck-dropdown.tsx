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
  IconCheck,
  IconCopy,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState } from "react";

export default function DeckDropdown({
  deck,
  children,
  align = "end",
}: {
  deck: Deck;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { mutateAsync: resetDeckHistory } = useResetDeckHistory();
  const { openDialogue } = useDeckDialogue();

  const handleResetDeckHistory = async () => {
    await resetDeckHistory(deck.id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setCopied(false); }}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()} onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              setIsOpen(false);
              setTimeout(() => openDialogue({ type: "new", id: deck.id }));
            }}
          >
            <IconPlus className="size-icon" />
            New deck
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(deck.id);
              setCopied(true);
              clearTimeout(copiedTimeout.current);
              copiedTimeout.current = setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <IconCheck className="size-icon" /> : <IconCopy className="size-icon" />}
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleResetDeckHistory}>
            <IconRefresh className="size-icon" />
            Reset history
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setIsOpen(false);
              setTimeout(() => openDialogue({
                type: "move",
                id: deck.id,
                parentId: deck.parentId,
              }));
            }}
          >
            <IconArrowsMove className="size-icon" />
            Move to
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setIsOpen(false);
              setTimeout(() => openDialogue({ type: "rename", id: deck.id, name: deck.name }));
            }}
          >
            <IconEdit className="size-icon" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              setIsOpen(false);
              setTimeout(() => openDialogue({ type: "delete", id: deck.id }));
            }}
          >
            <IconTrash className="size-icon text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
