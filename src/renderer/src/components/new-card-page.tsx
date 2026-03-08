import CardForm from "@/components/card-form";
import { useEffect, useState } from "react";

function loadGoogleFont(fontValue: string) {
  // Extract font name from CSS value like '"Roboto Slab", serif'
  const match = fontValue.match(/"([^"]+)"/);
  if (!match) return;
  const name = match[1];
  const id = `font-${name.replace(/\s/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export default function NewCardPage() {
  const [deckId, setDeckId] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Apply font preferences from localStorage (set by DebugTools in main window)
    const uiFont = localStorage.getItem("debug-ui-font");
    const contentFont = localStorage.getItem("debug-content-font");
    if (uiFont) {
      document.documentElement.style.setProperty("--app-font", uiFont);
      loadGoogleFont(uiFont);
    }
    if (contentFont) {
      document.documentElement.style.setProperty("--app-content-font", contentFont);
      loadGoogleFont(contentFont);
    }
    if (localStorage.getItem("debug-dark") === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on("show-new-card", (_event, id: string | null) => {
      setDeckId(id);
    });

    window.electron.ipcRenderer.on("reset-new-card", () => {
      setDeckId(null);
      setKey((k) => k + 1);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div id="desktop-header" className="h-10 shrink-0" />
      <div className="flex-1">
        <CardForm key={key} deckId={deckId} />
      </div>
    </div>
  );
}
