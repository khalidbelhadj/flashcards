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
  "Web Development": [
    {
      front: "What does HTTP stand for and what problem does it solve?",
      back: "Hypertext Transfer Protocol; it standardizes how clients and servers communicate on the web using requests and responses.",
    },
    {
      front: "What is the difference between HTTP and HTTPS?",
      back: "HTTPS is HTTP over TLS/SSL, providing encryption, integrity, and authentication.",
    },
    {
      front: "Define REST in the context of web APIs.",
      back: "Representational State Transfer; an architectural style that uses stateless operations, resources, and standard HTTP methods.",
    },
    {
      front: "What is the role of a CDN?",
      back: "A Content Delivery Network caches and serves assets from edge locations to reduce latency and offload origin servers.",
    },
    {
      front: "What problem does CORS address?",
      back: "Cross-Origin Resource Sharing controls which origins can access resources across domain boundaries for security.",
    },
  ],
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
  Frontend: [
    {
      front: "What is the difference between SSR, SSG, and CSR?",
      back: "SSR renders on the server per request, SSG builds static HTML at build time, CSR renders on the client after JS loads.",
    },
    {
      front: "Why is accessibility (a11y) important on the web?",
      back: "It ensures content is usable by people with disabilities, improves UX for everyone, and is often a legal requirement.",
    },
    {
      front: "What are web vitals and why do they matter?",
      back: "Core metrics (e.g., LCP, CLS, INP) that quantify user-perceived performance and impact search ranking and UX.",
    },
    {
      front: "Explain bundling vs. code splitting.",
      back: "Bundling combines modules into a single file; code splitting creates smaller chunks loaded on demand to improve performance.",
    },
    {
      front: "What is hydration?",
      back: "The process where client-side JS attaches event listeners to server-rendered HTML to make it interactive.",
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
  Backend: [
    {
      front: "What is horizontal vs. vertical scaling?",
      back: "Vertical increases resources on a single node; horizontal adds more nodes to distribute load.",
    },
    {
      front: "Explain idempotency of HTTP methods.",
      back: "An operation is idempotent if multiple identical requests have the same effect as one (e.g., GET, PUT, DELETE).",
    },
    {
      front: "What is a message queue used for?",
      back: "Decoupling services and smoothing load by asynchronously processing tasks (e.g., RabbitMQ, SQS, Kafka).",
    },
    {
      front: "Define ACID in databases.",
      back: "Atomicity, Consistency, Isolation, Durability — guarantees for reliable transactions.",
    },
    {
      front: "Why use connection pooling?",
      back: "To reuse DB connections, reducing overhead and improving throughput under load.",
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
  Biology: [
    {
      front: "What is the central dogma of molecular biology?",
      back: "Information flows DNA → RNA → protein via transcription and translation.",
    },
    {
      front: "Define homeostasis.",
      back: "The tendency of biological systems to maintain stable internal conditions despite external changes.",
    },
    {
      front: "What are the four major classes of biomolecules?",
      back: "Carbohydrates, lipids, proteins, and nucleic acids.",
    },
    {
      front: "Differentiate genotype and phenotype.",
      back: "Genotype is the genetic makeup; phenotype is the observable traits resulting from genotype and environment.",
    },
    {
      front: "What is natural selection?",
      back: "A mechanism of evolution where heritable traits that improve fitness become more common in a population.",
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
  "Life Sciences": [
    {
      front: "What is the scientific method?",
      back: "A systematic process: observation, hypothesis, experimentation, analysis, conclusion, and replication.",
    },
    {
      front: "Define epidemiology.",
      back: "The study of the distribution and determinants of health-related states in populations.",
    },
    {
      front: "What is a double-blind study?",
      back: "A study where neither participants nor researchers know who receives the treatment, reducing bias.",
    },
    {
      front: "Differentiate correlation and causation.",
      back: "Correlation is association between variables; causation indicates that one variable produces an effect in another.",
    },
    {
      front: "What is peer review?",
      back: "Evaluation of scientific work by independent experts to ensure quality and validity before publication.",
    },
  ],
};

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
