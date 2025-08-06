import { and, eq } from "drizzle-orm";
import { updateCardLastReview } from "src/lib/cards-api";
import db from "src/lib/db";
import { reviewsTable } from "src/lib/schema";

export async function createReview(
  deckId: string,
  cardId: string,
  rating: "hard" | "good" | "easy",
) {
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

export default {};
