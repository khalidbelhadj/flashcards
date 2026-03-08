import CardForm from "@/components/card-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconExternalLink, IconX } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NewCardDialog({
  open,
  onClose,
  deckId,
}: {
  open: boolean;
  onClose: () => void;
  deckId: string | null;
}) {
  const handleOpenInNewWindow = () => {
    window.electron.ipcRenderer.invoke("open-new-card-window", deckId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>New card</DialogTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={handleOpenInNewWindow}>
                  <IconExternalLink className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in new window</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <IconX className="size-4" />
            </Button>
          </div>
        </DialogHeader>
        <CardForm deckId={deckId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
