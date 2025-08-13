import { and, eq } from "drizzle-orm";
import { getCard, updateCardLastReview } from "src/lib/cards-api";
import db from "src/lib/db";
import { Minutes, schedule } from "src/lib/schedule";
import { cardsTable, Rating, reviewsTable } from "src/lib/schema";

export async function createReview(
  deckId: string,
  cardId: string,
  rating: Rating,
) {
  const card = await getCard(cardId);
  if (!card) {
    throw new Error("Card not found");
  }

  const interval: Minutes = await schedule(card, rating);
  const dueDate = new Date(Date.now() + interval * 60 * 1000);

  await db
    .update(cardsTable)
    .set({ interval, dueDate: dueDate.toISOString(), n: card.n + 1 })
    .where(eq(cardsTable.id, cardId));

  await db.insert(reviewsTable).values({
    deckId,
    cardId,
    rating,
  });

  // Update the card's lastReview timestamp
  await updateCardLastReview(cardId);

  return { deckId, cardId, rating };
}

export async function getReviews(deckId?: string, cardId?: string) {
  if (deckId && cardId) {
    return await db
      .select()
      .from(reviewsTable)
      .where(
        and(eq(reviewsTable.deckId, deckId), eq(reviewsTable.cardId, cardId)),
      )
      .all();
  } else if (deckId) {
    return await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.deckId, deckId))
      .all();
  } else if (cardId) {
    return await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.cardId, cardId))
      .all();
  }

  return await db.select().from(reviewsTable).all();
}
