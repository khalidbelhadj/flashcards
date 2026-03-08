import { DeckPicker } from "@/components/deck-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateCard } from "@/queries/card-queries";
import { useEffect, useRef, useState } from "react";

export default function CardForm({
  deckId,
  onClose,
}: {
  deckId: string | null;
  onClose?: () => void;
}) {
  const [location, setLocation] = useState<string | null>(deckId);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);
  const frontRef = useRef<HTMLTextAreaElement>(null);

  const { mutateAsync: createCard } = useCreateCard();

  useEffect(() => {
    setLocation(deckId);
  }, [deckId]);

  const handleCreate = async () => {
    if (!front.trim() || !back.trim() || !location) return;
    setLoading(true);
    try {
      await createCard({ deckId: location, front: front.trim(), back: back.trim() });
      setFront("");
      setBack("");
      frontRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>Location</Label>
          <DeckPicker id={location} setId={setLocation} collapsible />
        </div>
        <div className="border rounded-md overflow-hidden">
          <div className="p-2 flex flex-col gap-1">
            <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
              Front
            </div>
            <textarea
              ref={frontRef}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Type the front of the card..."
              rows={3}
              autoFocus
              className="w-full resize-none bg-transparent font-content outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="p-2 flex flex-col gap-1 border-t border-dashed">
            <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
              Back
            </div>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Type the back of the card..."
              rows={3}
              className="w-full resize-none bg-transparent font-content outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-4 pb-4 mt-auto">
        {onClose && (
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleCreate} disabled={loading}>
          Create
        </Button>
      </div>
    </div>
  );
}
