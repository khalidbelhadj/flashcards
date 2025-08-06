import db from "src/lib/db";
import { cardsTable, decksTable } from "src/lib/schema";
import { v4 as uuidv4 } from "uuid";

// Sample deck data with hierarchical structure
const deckData = [
  {
    name: "Web Development",
    children: [
      {
        name: "Frontend",
        children: [{ name: "React" }, { name: "CSS" }],
      },
      {
        name: "Backend",
        children: [{ name: "Node.js" }],
      },
    ],
  },
  {
    name: "Life Sciences",
    children: [
      {
        name: "Biology",
        children: [{ name: "Cell Biology" }],
      },
      {
        name: "Medicine",
      },
    ],
  },
];

// Sample cards for different subjects
const cardTemplates = {
  React: [
    {
      front: "What is JSX?",
      back: "A syntax extension for JavaScript that looks like XML/HTML.",
    },
    {
      front: "What is a component in React?",
      back: "A reusable, self-contained piece of UI.",
    },
    {
      front: "What is the difference between state and props?",
      back: "State is managed within the component, while props are passed to the component.",
    },
    {
      front: "What is the virtual DOM?",
      back: "A lightweight copy of the actual DOM, used by React for performance optimization.",
    },
    {
      front: "What is a hook in React?",
      back: "A function that lets you 'hook into' React state and lifecycle features from function components.",
    },
    {
      front: "What is `useState` used for?",
      back: "It is a Hook that lets you add React state to function components.",
    },
  ],
  CSS: [
    {
      front: "What is the box model?",
      back: "A model that describes the rectangular boxes that are generated for elements in the document tree.",
    },
    {
      front: "What is Flexbox?",
      back: "A one-dimensional layout model for arranging items in rows or columns.",
    },
    {
      front: "What is a pseudo-class?",
      back: "A keyword added to a selector that specifies a special state of the selected element(s).",
    },
    {
      front: "What does 'cascading' in CSS refer to?",
      back: "The rules that determine how styles are applied when multiple style rules apply to the same element.",
    },
    {
      front: "What is the difference between `em` and `rem` units?",
      back: "`em` is relative to the font-size of the parent, while `rem` is relative to the font-size of the root element.",
    },
  ],
  "Node.js": [
    {
      front: "What is Node.js?",
      back: "A JavaScript runtime built on Chrome's V8 JavaScript engine.",
    },
    { front: "What is NPM?", back: "The default package manager for Node.js." },
    {
      front: "What is the event loop in Node.js?",
      back: "It allows Node.js to perform non-blocking I/O operations.",
    },
    {
      front: "What is a module in Node.js?",
      back: "A block of code that can be reused throughout an application.",
    },
    {
      front: "How do you handle asynchronous operations in Node.js?",
      back: "Using callbacks, promises, or async/await syntax.",
    },
    {
      front: "What is Express.js?",
      back: "A minimal and flexible Node.js web application framework.",
    },
  ],
  "Cell Biology": [
    {
      front: "What is the function of the mitochondria?",
      back: "Generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
    },
    {
      front: "What is the nucleus?",
      back: "A membrane-bound organelle that contains the cell's genetic material.",
    },
    {
      front: "What is the difference between prokaryotic and eukaryotic cells?",
      back: "Eukaryotic cells have a nucleus and other membrane-bound organelles, while prokaryotic cells do not.",
    },
    {
      front: "What is mitosis?",
      back: "A part of the cell cycle in which replicated chromosomes are separated into two new nuclei.",
    },
    {
      front: "What is meiosis?",
      back: "A special type of cell division that reduces the chromosome number by half, creating four haploid cells.",
    },
  ],
  Medicine: [
    {
      front: "What is a vaccine?",
      back: "A biological preparation that provides active acquired immunity to a particular infectious disease.",
    },
    {
      front: "What are antibiotics used for?",
      back: "To treat or prevent some types of bacterial infection.",
    },
    {
      front: "What is the Hippocratic Oath?",
      back: "An oath of ethics historically taken by physicians.",
    },
    {
      front: "What is a placebo?",
      back: "A substance or treatment which is designed to have no therapeutic value.",
    },
    {
      front: "What is an MRI?",
      back: "Magnetic resonance imaging, a medical imaging technique used in radiology to form pictures of the anatomy and the physiological processes of the body.",
    },
  ],
};

// Utility function to create timestamp
function createTimestamp() {
  return new Date().toISOString();
}

// Function to generate random card status
function getRandomStatus() {
  const statuses = ["new", "learning", "review"];
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
    if (cardTemplates[deck.name]) {
      const templates = cardTemplates[deck.name];

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
