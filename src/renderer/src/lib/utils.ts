import { clsx, type ClassValue } from "clsx";
import { DecksRow } from "src/lib/schema";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to display in an "ago" format
 * @param date
 * @returns
 */
export function formatDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
  if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
  if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

/**
 * Format a number to use commas
 * @param num
 * @param locale
 * @returns
 */
export function formatNumber(num: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

export type Deck = DecksRow & {
  cardCount: number;
  new: number;
  learning: number;
  reviewing: number;
};

export type DeckWithDepth = Deck & { depth: number };

export type Node = Deck & { children: Node[] };

export function buildTree(decks: Deck[]) {
  const map = new Map<string | null, Node>();

  for (const deck of decks) {
    map.set(deck.id, { ...deck, children: [] });
  }

  for (const deck of decks) {
    const node = map.get(deck.id);
    const parent = map.get(deck.parentId);
    if (node && parent) {
      parent.children.push(node);
    }
  }

  return Array.from(map.values()).filter((deck) => deck.parentId === null);
}

export function flatten(nodes: Node[], expanded: Set<string>) {
  const result: DeckWithDepth[] = [];
  const stack = nodes.toReversed().map((node) => ({ ...node, depth: 0 }));

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) throw new Error("Bruh");
    result.push(current);
    if (!expanded.has(current.id)) continue;
    for (const child of current.children) {
      stack.push({ ...child, depth: current.depth + 1 });
    }
  }

  return result;
}
