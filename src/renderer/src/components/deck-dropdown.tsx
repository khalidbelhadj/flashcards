import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeckDialogue } from "@/contexts/deck-dialogue-context";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Deck } from "@/lib/utils";
import { useDueCards } from "@/queries/card-queries";
import {
  IconArrowsMove,
  IconCards,
  IconCheck,
  IconCircleDashed,
  IconCopy,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

export default function DeckDropdown({
  deck,
  children,
  align = "end",
  onOpenChange: onOpenChangeProp,
}: {
  deck: Deck;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { openDialogue } = useDeckDialogue();
  const navigate = useNavigate();
  const { data: dueCards } = useDueCards(deck.id);

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => { setIsOpen(open); onOpenChangeProp?.(open); if (!open) setCopied(false); }}>
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconCircleDashed className="size-icon" />
              Review
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <ReviewOption
                count={dueCards?.length ?? 0}
                icon={<IconCircleDashed className="size-icon" />}
                label="Due cards"
                onSelect={() => navigate(`/decks/${deck.id}/review`)}
              />
              <ReviewOption
                count={deck.cardCount}
                icon={<IconCards className="size-icon" />}
                label="All cards"
                onSelect={() => navigate(`/decks/${deck.id}/review?mode=cram`)}
              />
              <ReviewOption
                count={deck.new}
                icon={<IconSparkles className="size-icon" />}
                label="New cards only"
                onSelect={() => navigate(`/decks/${deck.id}/review?mode=new`)}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
              setTimeout(() => openDialogue({ type: "reset-history", id: deck.id }));
            }}
          >
            <IconRefresh className="size-icon text-destructive" />
            Reset history
          </DropdownMenuItem>
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

function ReviewOption({
  count,
  icon,
  label,
  onSelect,
}: {
  count: number;
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  const disabled = count === 0;
  const item = (
    <DropdownMenuItem disabled={disabled} onSelect={onSelect}>
      {icon}
      {label}
      <Badge variant="secondary" className="ml-auto">{count}</Badge>
    </DropdownMenuItem>
  );

  if (!disabled) return item;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{item}</div>
      </TooltipTrigger>
      <TooltipContent side="right">No cards to review</TooltipContent>
    </Tooltip>
  );
}
