import { desc, eq, isNull, sql } from "drizzle-orm";
import db from "src/lib/db";
import { cardsTable, DecksRow, decksTable } from "src/lib/schema";

/**
 * @param parentId
 * @returns Decks which are a direct child of the given parent ID. If parentId is null, returns root decks.
 */
export async function getDecks(parentId: string | null) {
  const condition =
    parentId === null
      ? isNull(decksTable.parentId)
      : eq(decksTable.parentId, parentId);

  const query = await db
    .select({
      deck: decksTable,
      new: sql<number>`SUM(CASE WHEN ${cardsTable.status} = 'new' THEN 1 ELSE 0 END)`,
      learning: sql<number>`SUM(CASE WHEN ${cardsTable.status} = 'learning' THEN 1 ELSE 0 END)`,
      reviewing: sql<number>`SUM(CASE WHEN ${cardsTable.status} = 'reviewing' THEN 1 ELSE 0 END)`,
      cardCount: sql<number>`COUNT(${cardsTable.id})`,
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .groupBy(decksTable.id)
    .where(condition)
    .orderBy(desc(decksTable.createdAt))
    .all();

  const result = query.map((row) => {
    const { deck, ...rest } = row;
    return { ...deck, ...rest };
  });
  return result;
}

/**
 *
 * @param parentId
 * @returns A flat array of all subdecks from a given parent ID, recursively including their own subdecks.
 */
export async function getDecksRecursive(parentId: string | null) {
  const nestedDecks: Awaited<ReturnType<typeof getDecks>> = [];
  const stack: (string | null)[] = [parentId];

  while (stack.length > 0) {
    const parentId = stack.pop();
    if (parentId === undefined) {
      throw new Error("Parent ID is undefined");
    }
    const decks = await getDecks(parentId);
    nestedDecks.push(...decks);
    stack.push(...decks.map((deck) => deck.id));
  }

  return nestedDecks;
}

export async function getById(id: string) {
  const row = await db
    .select({
      deck: decksTable,
      new: sql<number>`SUM(CASE WHEN ${cardsTable.status} = 'new' THEN 1 ELSE 0 END)`,
      learning: sql<number>`SUM(CASE WHEN ${cardsTable.status} = 'learning' THEN 1 ELSE 0 END)`,
      reviewing: sql<number>`SUM(CASE WHEN ${cardsTable.status} = 'reviewing' THEN 1 ELSE 0 END)`,
      cardCount: sql<number>`COUNT(${cardsTable.id})`,
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .groupBy(decksTable.id)
    .where(eq(decksTable.id, id))
    .get();

  if (!row) {
    throw new Error(`Deck with id ${id} not found`);
  }

  const { deck, ...rest } = row;
  return { ...deck, ...rest };
}

export async function createDeck(name: string, parentId: string | null) {
  await db.insert(decksTable).values({
    name,
    parentId,
  });
}

export async function renameDeck(id: string, name: string) {
  await db.update(decksTable).set({ name }).where(eq(decksTable.id, id)).run();
  return id;
}

export async function getPathTo(id: string) {
  const path: DecksRow[] = [];
  let currentDeckId: string | null = id;
  while (currentDeckId) {
    const deck = await getById(currentDeckId);
    if (!deck) {
      break;
    }
    path.unshift(deck);
    currentDeckId = deck.parentId;
  }
  return path;
}

export async function deleteDeck(id: string) {
  await db.delete(decksTable).where(eq(decksTable.id, id)).run();
}

export async function setLastReviewed(id: string, date: string) {
  await db
    .update(decksTable)
    .set({ lastReview: date })
    .where(eq(decksTable.id, id))
    .run();
}

export async function moveDeck(id: string, parentId: string | null) {
  await db
    .update(decksTable)
    .set({ parentId })
    .where(eq(decksTable.id, id))
    .run();
}
