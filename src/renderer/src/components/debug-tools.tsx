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

export const progressColorSchemes = {
  "green-orange-blue": {
    label: "Green / Orange / Blue",
    new: { border: "border-green-500/50", bg: "bg-green-500/15" },
    learning: { border: "border-orange-500/50", bg: "bg-orange-500/15" },
    reviewing: { border: "border-blue-500/50", bg: "bg-blue-500/15" },
  },
  "emerald-amber-indigo": {
    label: "Emerald / Amber / Indigo",
    new: { border: "border-emerald-500/50", bg: "bg-emerald-500/15" },
    learning: { border: "border-amber-500/50", bg: "bg-amber-500/15" },
    reviewing: { border: "border-indigo-500/50", bg: "bg-indigo-500/15" },
  },
  "teal-rose-violet": {
    label: "Teal / Rose / Violet",
    new: { border: "border-teal-500/50", bg: "bg-teal-500/15" },
    learning: { border: "border-rose-500/50", bg: "bg-rose-500/15" },
    reviewing: { border: "border-violet-500/50", bg: "bg-violet-500/15" },
  },
  "lime-yellow-sky": {
    label: "Lime / Yellow / Sky",
    new: { border: "border-lime-500/50", bg: "bg-lime-500/15" },
    learning: { border: "border-yellow-500/50", bg: "bg-yellow-500/15" },
    reviewing: { border: "border-sky-500/50", bg: "bg-sky-500/15" },
  },
  "red-amber-green": {
    label: "Red / Amber / Green",
    new: { border: "border-red-500/50", bg: "bg-red-500/15" },
    learning: { border: "border-amber-500/50", bg: "bg-amber-500/15" },
    reviewing: { border: "border-green-500/50", bg: "bg-green-500/15" },
  },
  "red-amber-blue": {
    label: "Red / Amber / Blue",
    new: { border: "border-red-500/50", bg: "bg-red-500/15" },
    learning: { border: "border-amber-500/50", bg: "bg-amber-500/15" },
    reviewing: { border: "border-blue-500/50", bg: "bg-blue-500/15" },
  },
  "primary": {
    label: "Primary (monochrome)",
    new: { border: "border-primary/30", bg: "bg-primary/10" },
    learning: { border: "border-primary/50", bg: "bg-primary/20" },
    reviewing: { border: "border-primary/70", bg: "bg-primary/30" },
  },
} as const;

export type ColorSchemeKey = keyof typeof progressColorSchemes;

export function getProgressColors() {
  const key = (localStorage.getItem("debug-progress-colors") || "red-amber-green") as ColorSchemeKey;
  return progressColorSchemes[key] || progressColorSchemes["red-amber-green"];
}

export function useProgressColors() {
  const [colors, setColors] = useState(getProgressColors);
  useEffect(() => {
    const handler = () => setColors(getProgressColors());
    window.addEventListener("progress-colors-changed", handler);
    return () => window.removeEventListener("progress-colors-changed", handler);
  }, []);
  return colors;
}

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
  const [colorScheme, setColorScheme] = useState<ColorSchemeKey>(() => (localStorage.getItem("debug-progress-colors") || "red-amber-green") as ColorSchemeKey);

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
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleDark(); }}>
            {dark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
            {dark ? "Light mode" : "Dark mode"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleCardInfo(); }}>
            {cardInfo ? <IconCheck className="size-3.5" /> : <IconBug className="size-3.5" />}
            Card Debug Info
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Progress Colors</DropdownMenuLabel>
          {(Object.keys(progressColorSchemes) as ColorSchemeKey[]).map((key) => (
            <DropdownMenuItem key={key} onSelect={(e) => { e.preventDefault(); setColorScheme(key); localStorage.setItem("debug-progress-colors", key); window.dispatchEvent(new Event("progress-colors-changed")); }}>
              {colorScheme === key ? <IconCheck className="size-3.5" /> : <span className="size-3.5" />}
              {progressColorSchemes[key].label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>UI Font</DropdownMenuLabel>
          {fonts.map((f) => (
            <DropdownMenuItem key={f.value} onSelect={(e) => { e.preventDefault(); setUiFont(f.value); }}>
              {uiFont === f.value ? <IconCheck className="size-3.5" /> : <span className="size-3.5" />}
              <span style={{ fontFamily: f.value }}>{f.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Content Font</DropdownMenuLabel>
          {fonts.map((f) => (
            <DropdownMenuItem key={f.value} onSelect={(e) => { e.preventDefault(); setContentFont(f.value); }}>
              {contentFont === f.value ? <IconCheck className="size-3.5" /> : <span className="size-3.5" />}
              <span style={{ fontFamily: f.value }}>{f.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
