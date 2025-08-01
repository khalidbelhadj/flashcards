import { relations } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
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
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  status: text({
    enum: ["new", "learning", "due"],
  })
    .notNull()
    .$default(() => "new"),
});

export const cardsRelations = relations(cardsTable, ({ one }) => ({
  deck: one(decksTable, {
    fields: [cardsTable.deckId],
    references: [decksTable.id],
    relationName: "cards",
  }),
}));

export type DecksRow = typeof decksTable.$inferSelect;
export type CardsRow = typeof cardsTable.$inferSelect;
