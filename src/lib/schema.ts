import { relations } from "drizzle-orm";
import { AnySQLiteColumn, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const decksTable = sqliteTable("decks", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$default(() => uuidv4()),
  name: text("name").notNull(),
  parentId: text("parent_id").references((): AnySQLiteColumn => decksTable.id, {
    onDelete: "cascade",
  }),
  lastReview: text("last_review"),
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$default(() => new Date().toISOString()),
});

export const decksRelations = relations(decksTable, ({ many, one }) => ({
  parent: one(decksTable, {
    fields: [decksTable.parentId],
    references: [decksTable.id],
    relationName: "children",
  }),
  children: many(decksTable, {
    relationName: "children",
  }),
  cards: many(cardsTable, {
    relationName: "cards",
  }),
  reviews: many(reviewsTable, { relationName: "reviews_deck" }),
}));

export const cardsTable = sqliteTable("cards", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$default(() => uuidv4()),
  deckId: text("deck_id")
    .notNull()
    .references(() => decksTable.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  lastReview: text("last_review"),
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  status: text({
    enum: ["new", "learning", "reviewing"],
  })
    .notNull()
    .$default(() => "new"),
});

export const cardsRelations = relations(cardsTable, ({ one, many }) => ({
  deck: one(decksTable, {
    fields: [cardsTable.deckId],
    references: [decksTable.id],
    relationName: "cards",
  }),
  reviews: many(reviewsTable, { relationName: "reviews_card" }),
}));

export const reviewsTable = sqliteTable("reviews", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$default(() => uuidv4()),
  deckId: text("deck_id")
    .notNull()
    .references(() => decksTable.id, { onDelete: "cascade" }),
  cardId: text("card_id")
    .notNull()
    .references(() => cardsTable.id, { onDelete: "cascade" }),
  rating: text("rating", {
    enum: ["forgot", "hard", "good", "easy"],
  }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
});

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  deck: one(decksTable, {
    relationName: "reviews_deck",
    fields: [reviewsTable.deckId],
    references: [decksTable.id],
  }),
  card: one(cardsTable, {
    relationName: "reviews_card",
    fields: [reviewsTable.cardId],
    references: [cardsTable.id],
  }),
}));

export type DecksRow = typeof decksTable.$inferSelect;
export type CardsRow = typeof cardsTable.$inferSelect;
export type ReviewsRow = typeof reviewsTable.$inferSelect;
export type Rating = (typeof reviewsTable.$inferSelect)["rating"];
