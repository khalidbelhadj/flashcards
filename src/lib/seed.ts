import db from "src/lib/db";
import { cardsTable, decksTable } from "src/lib/schema";
import { v4 as uuidv4 } from "uuid";
import cardData from "./seed-cards.json";
import deckData from "./seed-decks.json";

// Utility function to create timestamp
function createTimestamp() {
  return new Date().toISOString();
}

// Function to generate random card status
function getRandomStatus() {
  const statuses = ["new", "learning", "reviewing"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Function to create deck with nested structure
function createDeckHierarchy(deckData, parentId = null) {
  const decks = [];

  for (const deck of deckData) {
    const deckId = uuidv4();
    const timestamp = createTimestamp();

    const deckRecord = {
      id: deckId,
      name: deck.name,
      parentId: parentId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // @ts-expect-error sldkfjsd
    decks.push(deckRecord);

    // Create children recursively
    if (deck.children) {
      // @ts-expect-error sldkfjsd
      const childDecks = createDeckHierarchy(deck.children, deckId);
      decks.push(...childDecks);
    }
  }

  return decks;
}

// Function to generate cards for decks
function generateCards(decks) {
  const cards = [];

  for (const deck of decks) {
    // Check if we have specific cards for this deck
    if (cardData[deck.name]) {
      const templates = cardData[deck.name];

      for (const template of templates) {
        const cardId = uuidv4();
        const timestamp = createTimestamp();

        const card = {
          id: cardId,
          deckId: deck.id,
          front: template.front,
          back: template.back,
          createdAt: timestamp,
          updatedAt: timestamp,
          status: getRandomStatus(),
        };

        // @ts-expect-error sldkfjsd
        cards.push(card);
      }
    } else {
      // Generate some generic cards for decks without specific templates
      const genericCards = Array.from({ length: 5 }, (_, i) => ({
        front: `What is a key concept #${i + 1} of ${deck.name}?`,
        back: `This is a placeholder for concept #${
          i + 1
        } in ${deck.name}. Understanding fundamentals is crucial for mastering ${
          deck.name
        }.`,
      }));

      for (const template of genericCards) {
        const cardId = uuidv4();
        const timestamp = createTimestamp();

        const card = {
          id: cardId,
          deckId: deck.id,
          front: template.front,
          back: template.back,
          createdAt: timestamp,
          updatedAt: timestamp,
          status: getRandomStatus(),
        };

        // @ts-expect-error sldkfjsd
        cards.push(card);
      }
    }
  }

  return cards;
}

// Main seed function
export async function seedDatabase(db, decksTable, cardsTable) {
  try {
    console.log("Starting database seed...");

    // Clear existing data
    await db.delete(cardsTable);
    await db.delete(decksTable);
    console.log("Cleared existing data");

    // Generate deck hierarchy
    const decks = createDeckHierarchy(deckData);
    console.log(`Generated ${decks.length} decks`);

    // Insert decks
    await db.insert(decksTable).values(decks);
    console.log("Inserted decks");

    // Generate and insert cards
    const cards = generateCards(decks);
    console.log(`Generated ${cards.length} cards`);

    await db.insert(cardsTable).values(cards);
    console.log("Inserted cards");

    console.log("Database seeding completed successfully!");

    // Print summary
    console.log("\n=== SEED SUMMARY ===");
    console.log(`Total decks created: ${decks.length}`);
    console.log(`Total cards created: ${cards.length}`);

    // Count root decks
    // @ts-expect-error sldkfjsd
    const rootDecks = decks.filter((d) => d.parentId === null);
    console.log(`Root decks: ${rootDecks.length}`);

    // Count nested decks
    // @ts-expect-error sldkfjsd
    const nestedDecks = decks.filter((d) => d.parentId !== null);
    console.log(`Nested decks: ${nestedDecks.length}`);

    return {
      decks: decks.length,
      cards: cards.length,
      rootDecks: rootDecks.length,
      nestedDecks: nestedDecks.length,
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seedDatabase(db, decksTable, cardsTable)
  .then((summary) => {
    console.log("Seed completed:", summary);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
  });
