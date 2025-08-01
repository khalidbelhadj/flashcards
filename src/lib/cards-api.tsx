import { and, desc, eq, inArray, or } from "drizzle-orm";
import { api } from "src/lib/api";
import db from "src/lib/db";
import { cardsTable } from "src/lib/schema";

export async function getCards(deckId: string | null, filter?: string) {
  if (deckId === null) {
    const cards = await db.select().from(cardsTable).all();
    return cards;
  }

  const nestedDecks = await api.decks.getDecksRecursive(deckId);
  const deckIds = nestedDecks.map((deck) => deck.id);
  deckIds.push(deckId);

  const condition = inArray(cardsTable.deckId, deckIds);

  const cards = await db
    .select()
    .from(cardsTable)
    .where(condition)
    .orderBy(desc(cardsTable.createdAt))
    .all();

  if (filter) {
    const filteredCards = cards.filter(
      (c) =>
        c.front.toLowerCase().includes(filter.toLowerCase()) ||
        c.back.toLowerCase().includes(filter.toLowerCase()),
    );
    return filteredCards;
  }

  return cards;
}

export async function createCard(deckId: string, front: string, back: string) {
  await db.insert(cardsTable).values({ deckId, front, back });
  return deckId;
}

export default {};
