import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconSettings, IconSun, IconMoon, IconCheck, IconBug } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const fonts = [
  { label: "Inter", value: '"Inter", sans-serif' },
  { label: "Roboto Slab", value: '"Roboto Slab", serif' },
  { label: "Merriweather", value: '"Merriweather", serif' },
  { label: "Noto Serif", value: '"Noto Serif", serif' },
];

function loadFont(name: string) {
  const id = `font-${name.replace(/\s/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export default function DebugTools() {
  const [uiFont, setUiFont] = useState(() => localStorage.getItem("debug-ui-font") || fonts[0].value);
  const [contentFont, setContentFont] = useState(() => localStorage.getItem("debug-content-font") || fonts[0].value);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [cardInfo, setCardInfo] = useState(() => localStorage.getItem("debug-show-card-info") === "true");

  useEffect(() => {
    fonts.slice(1).forEach((f) => loadFont(f.label));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font", uiFont);
    localStorage.setItem("debug-ui-font", uiFont);
  }, [uiFont]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-content-font", contentFont);
    localStorage.setItem("debug-content-font", contentFont);
  }, [contentFont]);

  useEffect(() => {
    const stored = localStorage.getItem("debug-dark");
    if (stored === "true") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("debug-dark", String(next));
  };

  const toggleCardInfo = () => {
    const next = !cardInfo;
    setCardInfo(next);
    localStorage.setItem("debug-show-card-info", String(next));
  };

  return (
    <div className="fixed bottom-3 left-3 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="rounded-full shadow-md">
            <IconSettings className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuItem onClick={toggleDark}>
            {dark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
            {dark ? "Light mode" : "Dark mode"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleCardInfo}>
            {cardInfo ? <IconCheck className="size-3.5" /> : <IconBug className="size-3.5" />}
            Card Debug Info
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>UI Font</DropdownMenuLabel>
          {fonts.map((f) => (
            <DropdownMenuItem key={f.value} onClick={() => setUiFont(f.value)}>
              {uiFont === f.value ? <IconCheck className="size-3.5" /> : <span className="size-3.5" />}
              <span style={{ fontFamily: f.value }}>{f.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Content Font</DropdownMenuLabel>
          {fonts.map((f) => (
            <DropdownMenuItem key={f.value} onClick={() => setContentFont(f.value)}>
              {contentFont === f.value ? <IconCheck className="size-3.5" /> : <span className="size-3.5" />}
              <span style={{ fontFamily: f.value }}>{f.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
