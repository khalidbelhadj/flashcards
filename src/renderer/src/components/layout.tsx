import { Outlet, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDeckPath, useDecks } from "@/queries/deck-queries";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Command = {
  id: string;
  name: string;
  description: string;
};
const commands: Command[] = [
  {
    id: "find-deck",
    name: "Find deck",
    description: "Search for a deck",
  },
  {
    id: "create-deck",
    name: "Create deck",
    description: "Create a deck within the current one ",
  },
  {
    id: "delete-deck",
    name: "Delete deck",
    description: "Delete the current deck",
  },
  {
    id: "rename-deck",
    name: "Rename deck",
    description: "Rename the current deck",
  },
  {
    id: "create-flashcard",
    name: "Create flashcard",
    description: "Create a flashcard using the default template",
  },
  {
    id: "create-flashcard-from-template",
    name: "Create flashcard from template",
    description: "Create a flashcard using a template",
  },
  {
    id: "go-home",
    name: "Home",
    description: "Go to home page",
  },
  {
    id: "go-back",
    name: "Back",
    description: "Navigate to the previous page",
  },
];

export default function Layout() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    document.onkeydown = (e) => {
      if (e.metaKey && e.key === "p") {
        setShow((prev) => !prev);
      }

      if (
        (e.key === "Escape" ||
          ((e.key === "g" || e.key === "c") && e.ctrlKey)) &&
        show
      ) {
        setShow(false);
        return;
      }
    };
  });

  return (
    <div className="w-screen h-screen bg-muted relative overflow-hidden">
      <Outlet />
      {show && <CommandPrompt hide={() => setShow(false)} />}
    </div>
  );
}

// Helper function to highlight matching text
const highlightMatch = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="bg-yellow-300/50 text-black">
        {part}
      </span>
    ) : (
      part
    ),
  );
};

function CommandPrompt({ hide }) {
  const [search, setSearch] = useState("");
  const [command, setCommand] = useState<string | null>(null);
  const [activeCommand, setActiveCommand] = useState(commands[0].id);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commands);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const activeIndex = filteredCommands.findIndex(
        (c) => c.id === activeCommand,
      );
      if (activeIndex >= 0) {
        const selectedElement = listRef.current.children[
          activeIndex
        ] as HTMLElement;
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }
  }, [activeCommand, filteredCommands]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    const newCommands = commands.filter(
      (c) =>
        c.name.toLowerCase().includes(newSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(newSearch.toLowerCase()),
    );

    if (newCommands.find((c) => c.id === activeCommand) === undefined) {
      if (newCommands.length > 0) {
        setActiveCommand(newCommands[0].id);
      } else {
        setActiveCommand("");
      }
    }
    setFilteredCommands(newCommands);
  };

  const handleSelectCommand = (id: string) => {
    handleSearchChange("");
    setCommand(id);
  };

  if (command === "find-deck") {
    return <FindDeck hide={hide} />;
  }

  // Helper function to get common prefix of filtered commands
  const getCommonPrefix = (commands: Command[], searchTerm: string) => {
    if (commands.length === 0) return "";
    if (commands.length === 1) return commands[0].name;

    // Find the longest common prefix among command names
    let prefix = "";
    const names = commands.map((cmd) => cmd.name);

    for (let i = 0; i < names[0].length; i++) {
      const char = names[0][i].toLowerCase();
      if (names.every((name) => name[i]?.toLowerCase() === char)) {
        prefix += names[0][i]; // Keep original case from first command
      } else {
        break;
      }
    }

    // Only return prefix if it's longer than current search
    return prefix.length > searchTerm.length ? prefix : searchTerm;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSelectCommand(activeCommand);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        const commonPrefix = getCommonPrefix(filteredCommands, search);
        if (commonPrefix.length > search.length) {
          // Complete with common prefix
          handleSearchChange(commonPrefix);
        } else {
          // No common prefix, complete with active command
          const activeCmd = filteredCommands.find(
            (c) => c.id === activeCommand,
          );
          if (activeCmd) {
            handleSearchChange(activeCmd.name);
          }
        }
      }
      return;
    }

    const activeIndex = filteredCommands.findIndex(
      (c) => c.id === activeCommand,
    );
    if ((e.ctrlKey && e.key === "n") || e.key == "ArrowDown") {
      e.preventDefault(); // Prevent cursor movement
      setActiveCommand(
        filteredCommands[Math.min(filteredCommands.length - 1, activeIndex + 1)]
          .id,
      );
      return;
    }
    if ((e.ctrlKey && e.key === "p") || e.key == "ArrowUp") {
      e.preventDefault(); // Prevent cursor movement
      setActiveCommand(filteredCommands[Math.max(0, activeIndex - 1)].id);
    }
  };

  if (command === null) {
    return (
      <div className="bg-background w-full border-t !text-base h-48 min-h-48 absolute bottom-0 flex flex-col">
        <Input
          autoFocus
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search command"
          className="w-full !outline-0 !ring-0 border-0 shadow-none p-0 !text-base px-2"
          spellCheck={false}
        />
        <div ref={listRef} className="overflow-y-scroll flex-1 px-2">
          {filteredCommands.map((command) => (
            <div
              key={command.id}
              onMouseEnter={() => setActiveCommand(command.id)}
              className={cn(
                "flex items-center gap-2 hover:cursor-pointer",
                command.id === activeCommand && "bg-accent",
              )}
              onClick={() => handleSelectCommand(command.id)}
            >
              <div className="font-medium">
                {highlightMatch(command.name, search)}
              </div>
              <div className="text-muted-foreground ml-auto">
                {highlightMatch(command.description, search)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-background w-full border-t !text-base h-48 min-h-48 absolute bottom-0 flex flex-col"
      onClick={() => setCommand(null)}
    >
      Command {command} not implemented yet :{"("}
      <Button className="w-fit">go back</Button>
    </div>
  );
}

function FindDeck({ hide }) {
  const [search, setSearch] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [activeDeck, setActiveDeck] = useState<string>("");
  const [isInputActive, setIsInputActive] = useState(true);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: path } = useDeckPath(id);
  const { data: decks } = useDecks(id);

  const filteredDecks = useMemo(
    () =>
      decks?.filter((deck) =>
        deck.name.toLowerCase().includes(search.toLowerCase()),
      ) || [],
    [decks, search],
  );

  // Set first deck as active when filtered decks change
  useEffect(() => {
    if (
      filteredDecks.length > 0 &&
      !filteredDecks.find((d) => d.id === activeDeck)
    ) {
      setActiveDeck(filteredDecks[0].id);
    } else if (filteredDecks.length === 0) {
      setActiveDeck("");
    }
  }, [filteredDecks, activeDeck]);

  // Scroll selected item into view
  useEffect(() => {
    if (isInputActive || !listRef.current || filteredDecks.length === 0) {
      return;
    }

    const activeIndex = filteredDecks.findIndex((d) => d.id === activeDeck);
    if (activeIndex < 0) {
      throw new Error("Invalid active deck: " + activeDeck);
    }

    const selectedElement = listRef.current.children[
      activeIndex
    ] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeDeck, filteredDecks, isInputActive]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  if (decks === undefined) return <div>loading</div>;
  if (path === undefined) return <div>loading path</div>;

  const back = () => {
    if (path.length > 0) {
      setId(path[path.length - 1].parentId);
      return;
    }
    hide();
  };

  const navigateToDeck = (deckId: string) => {
    hide();
    navigate(`/decks/${deckId}`);
  };

  const addToPath = (deckId: string) => {
    setSearch("");
    setId(deckId);
    setIsInputActive(true);
    // Refocus input after path update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && search === "") {
      back();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (isInputActive) {
        // Input is selected - navigate to current deck or exit if no current deck
        if (id) {
          navigateToDeck(id);
        } else {
          hide();
        }
      } else {
        // List item is selected - add to path
        const selectedDeck = filteredDecks.find((d) => d.id === activeDeck);
        if (selectedDeck) {
          addToPath(selectedDeck.id);
        }
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (filteredDecks.length > 0) {
        if (isInputActive) {
          // Input selected - add topmost deck to path
          addToPath(filteredDecks[0].id);
        } else {
          // List item selected - add selected deck to path
          const selectedDeck = filteredDecks.find((d) => d.id === activeDeck);
          if (selectedDeck) {
            addToPath(selectedDeck.id);
          }
        }
      }
      return;
    }

    if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) {
      e.preventDefault();
      if (isInputActive) {
        // Move from input to first list item
        if (filteredDecks.length > 0) {
          setIsInputActive(false);
          setActiveDeck(filteredDecks[0].id);
        }
      } else {
        // Navigate within list
        const activeIndex = filteredDecks.findIndex((d) => d.id === activeDeck);
        if (activeIndex >= 0 && activeIndex < filteredDecks.length - 1) {
          setActiveDeck(filteredDecks[activeIndex + 1].id);
        }
      }
      return;
    }

    if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) {
      e.preventDefault();
      if (isInputActive) {
        // Stay on input
        return;
      } else {
        const activeIndex = filteredDecks.findIndex((d) => d.id === activeDeck);
        if (activeIndex > 0) {
          setActiveDeck(filteredDecks[activeIndex - 1].id);
        } else {
          // Move back to input
          setIsInputActive(true);
        }
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      hide();
      return;
    }
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setIsInputActive(true); // Return focus to input when typing
  };

  const handleDeckClick = (deckId: string) => {
    addToPath(deckId);
  };

  const handleDeckMouseEnter = (deckId: string) => {
    setActiveDeck(deckId);
    setIsInputActive(false);
  };

  return (
    <div className="bg-background w-full border-t !text-base h-48 min-h-48 absolute bottom-0 flex flex-col">
      <div className="flex items-center w-full">
        <div className="flex gap-1">
          {path.map((p, index) => (
            <div
              key={p.id || index}
              className="border w-fit text-nowrap px-1 rounded-md text-sm bg-muted"
            >
              {p.name}
            </div>
          ))}
        </div>
        <Input
          ref={inputRef}
          autoFocus
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsInputActive(true)}
          placeholder="Find deck"
          className={cn(
            "w-full !outline-0 !ring-0 border-0 shadow-none p-0 !text-base px-2",
            isInputActive && "bg-muted",
          )}
          spellCheck={false}
        />
      </div>

      <div ref={listRef} className="overflow-y-scroll flex-1 px-2">
        {filteredDecks.map((deck) => (
          <div
            key={deck.id}
            onMouseEnter={() => handleDeckMouseEnter(deck.id)}
            className={cn(
              "flex items-center gap-2 hover:cursor-pointer",
              deck.id === activeDeck && !isInputActive && "bg-accent",
            )}
            onClick={() => handleDeckClick(deck.id)}
          >
            <div className="font-medium">
              {highlightMatch(deck.name, search)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
