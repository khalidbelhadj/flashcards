import db from "src/lib/db";
import { cardsTable, decksTable } from "src/lib/schema";
import { v4 as uuidv4 } from "uuid";

// Sample deck data with hierarchical structure
const deckData = [
  {
    name: "Programming Languages",
    children: [
      {
        name: "JavaScript",
        children: [
          { name: "ES6 Features" },
          { name: "Async Programming" },
          { name: "DOM Manipulation" },
        ],
      },
      {
        name: "Python",
        children: [
          { name: "Data Structures" },
          { name: "Object-Oriented Programming" },
          { name: "Libraries & Frameworks" },
        ],
      },
      {
        name: "TypeScript",
        children: [{ name: "Type System" }, { name: "Advanced Types" }],
      },
    ],
  },
  {
    name: "Mathematics",
    children: [
      {
        name: "Algebra",
        children: [
          { name: "Linear Equations" },
          { name: "Quadratic Functions" },
        ],
      },
      {
        name: "Calculus",
        children: [
          { name: "Derivatives" },
          { name: "Integrals" },
          { name: "Limits" },
        ],
      },
      {
        name: "Statistics",
        children: [{ name: "Descriptive Statistics" }, { name: "Probability" }],
      },
    ],
  },
  {
    name: "Science",
    children: [
      {
        name: "Physics",
        children: [{ name: "Mechanics" }, { name: "Thermodynamics" }],
      },
      {
        name: "Chemistry",
        children: [{ name: "Organic Chemistry" }, { name: "Periodic Table" }],
      },
    ],
  },
  {
    name: "History",
    children: [
      {
        name: "World War II",
      },
      {
        name: "Ancient Civilizations",
        children: [{ name: "Roman Empire" }, { name: "Ancient Egypt" }],
      },
    ],
  },
  {
    name: "Languages",
    children: [
      {
        name: "Spanish",
        children: [{ name: "Basic Vocabulary" }, { name: "Grammar Rules" }],
      },
      {
        name: "French",
        children: [{ name: "Pronunciation" }, { name: "Common Phrases" }],
      },
    ],
  },
];

// Sample cards for different subjects
const cardTemplates = {
  "ES6 Features": [
    {
      front: "What is arrow function syntax?",
      back: "() => {} - A concise way to write functions",
    },
    {
      front: "What does const do?",
      back: "Declares a block-scoped constant variable",
    },
    {
      front: "What is template literal syntax?",
      back: "`Hello ${name}` - Allows embedded expressions",
    },
    {
      front: "What is destructuring?",
      back: "Extracts values from arrays/objects: const {a, b} = obj",
    },
  ],
  "Async Programming": [
    {
      front: "What is a Promise?",
      back: "An object representing eventual completion/failure of async operation",
    },
    {
      front: "What is async/await?",
      back: "Syntactic sugar for working with Promises",
    },
    {
      front: "What is Promise.all()?",
      back: "Waits for all promises to resolve or any to reject",
    },
    {
      front: "What is the event loop?",
      back: "Mechanism that handles async operations in JavaScript",
    },
  ],
  "DOM Manipulation": [
    {
      front: "How to select element by ID?",
      back: "document.getElementById('id')",
    },
    {
      front: "How to add event listener?",
      back: "element.addEventListener('click', handler)",
    },
    {
      front: "How to create new element?",
      back: "document.createElement('div')",
    },
    {
      front: "How to modify element content?",
      back: "element.textContent = 'new text'",
    },
  ],
  "Data Structures": [
    {
      front: "What is a list in Python?",
      back: "Ordered, mutable collection: [1, 2, 3]",
    },
    {
      front: "What is a dictionary?",
      back: "Key-value pairs: {'key': 'value'}",
    },
    {
      front: "What is a set?",
      back: "Unordered collection of unique elements",
    },
    {
      front: "What is a tuple?",
      back: "Ordered, immutable collection: (1, 2, 3)",
    },
  ],
  "Object-Oriented Programming": [
    {
      front: "What is a class?",
      back: "Blueprint for creating objects with attributes and methods",
    },
    {
      front: "What is inheritance?",
      back: "Mechanism where class inherits properties from another class",
    },
    {
      front: "What is encapsulation?",
      back: "Bundling data and methods that operate on data within one unit",
    },
    {
      front: "What is polymorphism?",
      back: "Ability of objects to take multiple forms",
    },
  ],
  "Type System": [
    {
      front: "What is a type annotation?",
      back: "Explicit declaration of variable type: let x: number",
    },
    {
      front: "What is an interface?",
      back: "Contract defining structure of an object",
    },
    {
      front: "What is a union type?",
      back: "Type that can be one of several types: string | number",
    },
    {
      front: "What is a generic?",
      back: "Type parameter that provides flexibility: Array<T>",
    },
  ],
  "Linear Equations": [
    {
      front: "What is slope-intercept form?",
      back: "y = mx + b, where m is slope and b is y-intercept",
    },
    { front: "How to find slope?", back: "m = (y2 - y1) / (x2 - x1)" },
    { front: "What is point-slope form?", back: "y - y1 = m(x - x1)" },
    { front: "What is standard form?", back: "Ax + By = C" },
  ],
  Derivatives: [
    {
      front: "What is a derivative?",
      back: "Rate of change of a function at a point",
    },
    { front: "Power rule?", back: "d/dx(x^n) = nx^(n-1)" },
    { front: "Product rule?", back: "d/dx(uv) = u'v + uv'" },
    { front: "Chain rule?", back: "d/dx(f(g(x))) = f'(g(x)) × g'(x)" },
  ],
  Mechanics: [
    {
      front: "What is Newton's first law?",
      back: "Object at rest stays at rest unless acted upon by force",
    },
    {
      front: "What is Newton's second law?",
      back: "F = ma (Force equals mass times acceleration)",
    },
    {
      front: "What is Newton's third law?",
      back: "For every action, there is equal and opposite reaction",
    },
    {
      front: "What is velocity?",
      back: "Rate of change of displacement with respect to time",
    },
  ],
  "Basic Vocabulary": [
    { front: "How do you say 'hello' in Spanish?", back: "Hola" },
    { front: "How do you say 'goodbye'?", back: "Adiós" },
    { front: "How do you say 'please'?", back: "Por favor" },
    { front: "How do you say 'thank you'?", back: "Gracias" },
  ],
  "World War II": [
    { front: "When did WWII start?", back: "September 1, 1939" },
    { front: "When did WWII end?", back: "September 2, 1945" },
    {
      front: "What was D-Day?",
      back: "Allied invasion of Normandy on June 6, 1944",
    },
    {
      front: "What was the Holocaust?",
      back: "Systematic genocide of Jews and others by Nazi Germany",
    },
  ],
  "Roman Empire": [
    { front: "Who was the first Roman Emperor?", back: "Augustus (Octavian)" },
    { front: "When did Rome fall?", back: "476 AD (Western Empire)" },
    {
      front: "What was the Colosseum used for?",
      back: "Gladiatorial contests and public spectacles",
    },
    {
      front: "What were Roman roads famous for?",
      back: "Excellent engineering and durability",
    },
  ],
};

// Utility function to create timestamp
function createTimestamp() {
  return new Date().toISOString();
}

// Function to generate random card status
function getRandomStatus() {
  const statuses = ["new", "learning", "due"];
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
      const genericCards = [
        {
          front: `What is the main concept of ${deck.name}?`,
          back: `${deck.name} is an important topic that requires study and practice.`,
        },
        {
          front: `Name a key principle in ${deck.name}`,
          back: `Understanding fundamentals is crucial for mastering ${deck.name}.`,
        },
      ];

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
