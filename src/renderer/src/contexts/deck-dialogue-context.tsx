import React, { createContext, useContext, useState } from "react";

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

interface DeckDialogueContextType {
  dialogue: DeckDialogue | null;
  openDialogue: (dialogue: DeckDialogue) => void;
  closeDialogue: () => void;
}

const DeckDialogueContext = createContext<DeckDialogueContextType | undefined>(
  undefined,
);

export function DeckDialogueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogue, setDialogue] = useState<DeckDialogue | null>(null);

  const openDialogue = (dialogue: DeckDialogue) => {
    setDialogue(dialogue);
  };

  const closeDialogue = () => {
    setDialogue(null);
  };

  return (
    <DeckDialogueContext.Provider
      value={{ dialogue, openDialogue, closeDialogue }}
    >
      {children}
    </DeckDialogueContext.Provider>
  );
}

export function useDeckDialogue() {
  const context = useContext(DeckDialogueContext);
  if (context === undefined) {
    throw new Error(
      "useDeckDialogue must be used within a DeckDialogueProvider",
    );
  }
  return context;
}
