import {
  DeckDialogueProvider,
  useDeckDialogue,
} from "@/contexts/deck-dialogue-context";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { DeckSearch } from "./deck-search";
import DebugTools from "./debug-tools";
import DeleteDeckDialog from "./delete-deck-dialog";
import MoveDeckDialog from "./move-deck-dialog";
import NewDeckDialog from "./new-deck-dialog";
import RenameDeckDialogue from "./rename-deck-dialog";

Date.now = () => {
  return new Date("2025-08-08").getTime();
};

function DeckDialogues() {
  const { dialogue, closeDialogue } = useDeckDialogue();

  if (!dialogue) return null;

  return (
    <>
      {dialogue.type === "move" && (
        <MoveDeckDialog
          open={dialogue.type === "move"}
          onClose={closeDialogue}
          id={dialogue.id}
          parentId={dialogue.parentId}
        />
      )}
      {dialogue.type === "rename" && (
        <RenameDeckDialogue
          open={dialogue.type === "rename"}
          onClose={closeDialogue}
          id={dialogue.id}
          name={dialogue.name}
        />
      )}
      {dialogue.type === "new" && (
        <NewDeckDialog
          id={dialogue.id}
          open={dialogue.type === "new"}
          onClose={closeDialogue}
        />
      )}
      {dialogue.type === "delete" && (
        <DeleteDeckDialog
          id={dialogue.id}
          open={dialogue.type === "delete"}
          onClose={closeDialogue}
        />
      )}
    </>
  );
}

function Layout() {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { openDialogue } = useDeckDialogue();
  const queryClient = useQueryClient();


  return (
    <div className="w-screen h-screen bg-background-dark relative overflow-hidden">
      <DeckSearch open={showSearch} onOpenChange={setShowSearch} />
      <DeckDialogues />
      <DebugTools />
      <Outlet />
    </div>
  );
}

function LayoutWithProvider() {
  return (
    <DeckDialogueProvider>
      <Layout />
    </DeckDialogueProvider>
  );
}

export default LayoutWithProvider;
