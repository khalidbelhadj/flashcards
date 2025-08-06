import { desc, eq } from "drizzle-orm";
import db from "src/lib/db";
import { cardsTable } from "src/lib/schema";

export async function getCards(deckId: string | null, filter?: string) {
  if (deckId === null) {
    const cards = await db.select().from(cardsTable).all();
    return cards;
  }

  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
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

export async function updateCardLastReview(cardId: string) {
  await db
    .update(cardsTable)
    .set({ lastReview: new Date().toISOString() })
    .where(eq(cardsTable.id, cardId));
  return cardId;
}

export default {};
