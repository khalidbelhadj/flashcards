// seedData.ts

import { randomUUID } from "crypto";
// @ts-expect-error import not working, but it's fine
import { initDb, db, closeDb } from "src/lib/db";

async function seed() {
  await initDb();

  // 1) Create some decks
  const decks = [
    { id: "deck-os", name: "Operating Systems" },
    { id: "deck-net", name: "Networking" },
    { id: "deck-fs", name: "File Systems" },
    { id: "deck-sec", name: "Security" },
  ];

  for (const { id, name } of decks) {
    await db.run(
      `INSERT OR IGNORE INTO decks (id, name) VALUES (?, ?)`,
      id,
      name,
    );
  }

  // 2) Prepare 20 flashcards across those decks
  type CardSeed = {
    deckId: string;
    type: "basic" | "multiple-choice" | "cloze";
    question?: string;
    answer?: string;
    variant?: "forward" | "reverse" | "both";
    choices?: Array<{ id: string; value: string; correct: boolean }>;
    text?: string;
  };

  const cards: CardSeed[] = [
    // Operating Systems (5)
    {
      deckId: "deck-os",
      type: "basic",
      variant: "forward",
      question: "What is a kernel?",
      answer:
        "The core component of an OS, managing CPU, memory, and device drivers.",
    },
    {
      deckId: "deck-os",
      type: "multiple-choice",
      question: "Which OS uses a monolithic kernel?",
      choices: [
        { id: randomUUID(), value: "Linux", correct: true },
        { id: randomUUID(), value: "Micro–XP", correct: false },
        { id: randomUUID(), value: "Minix", correct: false },
        { id: randomUUID(), value: "Windows 3.1", correct: false },
      ],
    },
    {
      deckId: "deck-os",
      type: "cloze",
      text: "In UNIX, everything is a [[file]], including devices and sockets.",
    },
    {
      deckId: "deck-os",
      type: "basic",
      variant: "both",
      question: "Name one popular Linux distribution.",
      answer: "Ubuntu",
    },
    {
      deckId: "deck-os",
      type: "cloze",
      text: "The [[shell]] is the command-line interpreter in many operating systems.",
    },

    // Networking (5)
    {
      deckId: "deck-net",
      type: "basic",
      variant: "forward",
      question: "What does TCP stand for?",
      answer: "Transmission Control Protocol",
    },
    {
      deckId: "deck-net",
      type: "multiple-choice",
      question: "Which layer is IP in the OSI model?",
      choices: [
        { id: randomUUID(), value: "Transport", correct: false },
        { id: randomUUID(), value: "Network", correct: true },
        { id: randomUUID(), value: "Data Link", correct: false },
        { id: randomUUID(), value: "Session", correct: false },
      ],
    },
    {
      deckId: "deck-net",
      type: "cloze",
      text: "The [[MAC address]] uniquely identifies a NIC at the data-link layer.",
    },
    {
      deckId: "deck-net",
      type: "basic",
      variant: "reverse",
      question: "What protocol provides domain-to-IP resolution?",
      answer: "DNS",
    },
    {
      deckId: "deck-net",
      type: "cloze",
      text: "TCP uses a three-way [[handshake]] to establish a connection.",
    },

    // File Systems (5)
    {
      deckId: "deck-fs",
      type: "basic",
      variant: "forward",
      question: "What does FAT stand for?",
      answer: "File Allocation Table",
    },
    {
      deckId: "deck-fs",
      type: "multiple-choice",
      question: "Which file system is native to Linux?",
      choices: [
        { id: randomUUID(), value: "NTFS", correct: false },
        { id: randomUUID(), value: "ext4", correct: true },
        { id: randomUUID(), value: "HFS+", correct: false },
        { id: randomUUID(), value: "FAT32", correct: false },
      ],
    },
    {
      deckId: "deck-fs",
      type: "cloze",
      text: "In journaling file systems, changes are first written to the [[journal]].",
    },
    {
      deckId: "deck-fs",
      type: "basic",
      variant: "both",
      question: "Name one Windows file system.",
      answer: "NTFS",
    },
    {
      deckId: "deck-fs",
      type: "cloze",
      text: "The [[inode]] stores metadata about a file on UNIX-like FSes.",
    },

    // Security (5)
    {
      deckId: "deck-sec",
      type: "basic",
      variant: "forward",
      question: "What does SSL/TLS encrypt?",
      answer: "Data in transit between client and server.",
    },
    {
      deckId: "deck-sec",
      type: "multiple-choice",
      question: "Which is a symmetric encryption algorithm?",
      choices: [
        { id: randomUUID(), value: "RSA", correct: false },
        { id: randomUUID(), value: "AES", correct: true },
        { id: randomUUID(), value: "ECC", correct: false },
        { id: randomUUID(), value: "DSA", correct: false },
      ],
    },
    {
      deckId: "deck-sec",
      type: "cloze",
      text: "A [[firewall]] filters incoming and outgoing network traffic.",
    },
    {
      deckId: "deck-sec",
      type: "basic",
      variant: "reverse",
      question: "What is two-factor authentication?",
      answer:
        "A security process requiring two different forms of identification.",
    },
    {
      deckId: "deck-sec",
      type: "cloze",
      text: "Public-key cryptography uses a [[key pair]]: public and private keys.",
    },
  ];

  // 3) Insert all cards
  const insertCard = await db.prepare(`
    INSERT OR REPLACE INTO cards
      (id, deck_id, type, question, answer, variant, choices, text)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of cards) {
    await insertCard.run(
      randomUUID(),
      c.deckId,
      c.type,
      c.question ?? null,
      c.answer ?? null,
      c.variant ?? null,
      c.choices ? JSON.stringify(c.choices) : null,
      c.text ?? null,
    );
  }

  await insertCard.finalize();
  console.log("✅ Seeded 4 decks and 20 flashcards.");
  await closeDb();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
