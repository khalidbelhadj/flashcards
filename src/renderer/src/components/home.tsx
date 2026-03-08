import { prefetchAllDecks } from "@/lib/utils";
import { useDueCards } from "@/queries/card-queries";
import { useQueryClient } from "@tanstack/react-query";
import { IconCards, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import Decks from "./decks";
import NewCardDialog from "./new-card-dialog";

export default function Home() {
  const qc = useQueryClient();
  prefetchAllDecks(qc);
  const { data: due } = useDueCards(null);
  const [newCardOpen, setNewCardOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center px-3 gap-4 overflow-clip max-h-screen min-h-0">
      <div id="desktop-header" className="w-full h-10 shrink-0" />
      <Decks />
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={async () => {
          const visible = await window.electron.ipcRenderer.invoke("is-new-card-window-visible");
          if (visible) {
            window.electron.ipcRenderer.invoke("open-new-card-window", null);
          } else {
            setNewCardOpen(true);
          }
        }}>
          <IconPlus data-icon="inline-start" /> New card
        </Button>
        {due && due.length > 0 && (
          <Button asChild icon={<IconCards className="size-4" />}>
            <NavLink to="/review">
              Review all
              <span className="ml-1 bg-primary-foreground/20 text-primary-foreground text-xs px-1.5 py-0.5 rounded-sm">
                {due.length}
              </span>
            </NavLink>
          </Button>
        )}
      </div>
      <NewCardDialog open={newCardOpen} onClose={() => setNewCardOpen(false)} deckId={null} />
    </div>
  );
}
