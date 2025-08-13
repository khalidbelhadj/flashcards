import { desc, eq, lte } from "drizzle-orm";
import db from "src/lib/db";
import { cardsTable, reviewsTable } from "src/lib/schema";

export async function getCard(id: string) {
  return await db.select().from(cardsTable).where(eq(cardsTable.id, id)).get();
}

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

export async function updateCard(cardId: string, front: string, back: string) {
  await db
    .update(cardsTable)
    .set({ front, back })
    .where(eq(cardsTable.id, cardId));
  return cardId;
}

export async function updateCardLastReview(cardId: string) {
  await db
    .update(cardsTable)
    .set({ lastReview: new Date().toISOString() })
    .where(eq(cardsTable.id, cardId));
  return cardId;
}

export async function deleteCard(cardId: string) {
  await db.delete(cardsTable).where(eq(cardsTable.id, cardId));
  return cardId;
}

export async function moveCard(cardId: string, deckId: string) {
  await db.update(cardsTable).set({ deckId }).where(eq(cardsTable.id, cardId));
}

export async function resetCardHistory(cardId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(reviewsTable).where(eq(reviewsTable.cardId, cardId));
    await tx
      .update(cardsTable)
      .set({ status: "new", lastReview: null, n: 0, interval: 0 })
      .where(eq(cardsTable.id, cardId));
  });
}

export async function resetDeckHistory(deckId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(reviewsTable).where(eq(reviewsTable.deckId, deckId));
    await tx
      .update(cardsTable)
      .set({ status: "new", lastReview: null, n: 0, interval: 0 })
      .where(eq(cardsTable.deckId, deckId));
  });
}

export async function duplicateCard(cardId: string) {
  const card = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .get();
  if (!card) throw new Error("Card not found");

  const newCard = await db
    .insert(cardsTable)
    .values({
      deckId: card.deckId,
      front: card.front,
      back: card.back,
    })
    .returning();
  return newCard;
}

export async function getDueCards() {
  const dueDate = new Date().toISOString();
  return await db
    .select()
    .from(cardsTable)
    .where(lte(cardsTable.dueDate, dueDate))
    .all();
}
