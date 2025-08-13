import db from "src/lib/db";
import { cardsTable, decksTable } from "src/lib/schema";
import { v4 as uuidv4 } from "uuid";

// Sample deck data with hierarchical structure
const deckData: {
  name: string;
  children: { name: string; children: { name: string }[] }[];
}[] = [
  {
    name: "Operating Systems",
    children: [
      { name: "File Systems", children: [{ name: "Ext4" }] },
      { name: "Networking", children: [{ name: "TCP/IP" }] },
    ],
  },
  {
    name: "Distributed Systems",
    children: [
      { name: "Consensus", children: [{ name: "Raft" }] },
      { name: "Fault Tolerance", children: [{ name: "Replication" }] },
    ],
  },
  {
    name: "Game Theory",
    children: [
      { name: "Nash Equilibrium", children: [{ name: "Prisoner's Dilemma" }] },
      { name: "Auctions", children: [{ name: "Vickrey Auction" }] },
    ],
  },
  {
    name: "Computer Architecture",
    children: [
      { name: "Caches", children: [{ name: "Cache Coherence" }] },
      { name: "Pipelines", children: [{ name: "Out-of-Order Execution" }] },
    ],
  },
];

// Sample cards for different subjects
const cardTemplates: {
  [key: string]: { front: string; back: string }[];
} = {
  "Operating Systems": [
    {
      front: "What is the role of the OS kernel?",
      back: "Manages hardware resources, provides scheduling, memory management, I/O, and system calls.",
    },
    {
      front: "Process vs thread?",
      back: "A process has its own address space; threads share a process's address space and resources.",
    },
    {
      front: "What is a system call?",
      back: "An API for user-space to request kernel services (e.g., open, read, write, fork).",
    },
    {
      front: "Define virtual memory.",
      back: "Abstraction mapping virtual to physical addresses with page tables, enabling isolation and demand paging.",
    },
    {
      front: "What is context switching?",
      back: "Saving/restoring CPU state to switch between threads/processes; incurs cache/TLB overhead.",
    },
  ],
  "File Systems": [
    {
      front: "What is journaling?",
      back: "Logging updates before applying to enable crash recovery; can log metadata and/or data.",
    },
    {
      front: "What is an inode?",
      back: "Per-file metadata structure with permissions, size, timestamps, and block pointers.",
    },
    {
      front: "Hard vs soft link?",
      back: "Hard links reference the same inode; soft links are path-based and can cross file systems.",
    },
    {
      front: "Directory structure?",
      back: "Maps names to inode numbers; often stored as B-trees or hashed tables for scalability.",
    },
    {
      front: "What causes fragmentation?",
      back: "Non-contiguous allocation over time; mitigated by extents and smarter allocators.",
    },
  ],
  Ext4: [
    {
      front: "What are extents in ext4?",
      back: "Represent contiguous block ranges, reducing metadata overhead and improving performance.",
    },
    {
      front: "Ext4 journaling modes?",
      back: "Ordered, writeback, and journal modes, trading performance for stronger consistency.",
    },
    {
      front: "Delayed allocation?",
      back: "Defers block allocation to improve contiguity and reduce fragmentation.",
    },
    {
      front: "HTree directories?",
      back: "Hash-indexed structure enabling fast lookups in large directories.",
    },
    {
      front: "Timestamp precision?",
      back: "Nanosecond timestamps with extended epoch handling to avoid Y2038 issues.",
    },
  ],
  Networking: [
    {
      front: "OSI vs TCP/IP?",
      back: "OSI has 7 layers; TCP/IP is 4-5 layers; models help reason about protocols and encapsulation.",
    },
    {
      front: "TCP vs UDP?",
      back: "TCP is reliable and ordered; UDP is connectionless and best-effort with lower latency.",
    },
    {
      front: "What is a socket?",
      back: "Abstraction for network endpoints, identified by IP, port, and protocol.",
    },
    {
      front: "Congestion control?",
      back: "Adjust sending rate based on loss/delay (e.g., Reno, CUBIC, BBR).",
    },
    {
      front: "What is NAT?",
      back: "Translates private addresses to public, conserving IPv4 and adding a basic barrier.",
    },
  ],
  "TCP/IP": [
    {
      front: "Three-way handshake?",
      back: "SYN → SYN-ACK → ACK establishes a TCP connection and negotiates options.",
    },
    {
      front: "Sliding window purpose?",
      back: "Controls in-flight bytes for flow control and pipelining.",
    },
    {
      front: "IP fragmentation?",
      back: "IPv4 may fragment large packets; reassembled at destination. IPv6 avoids router fragmentation.",
    },
    {
      front: "ARP role?",
      back: "Resolves IP to MAC on local networks via requests/replies.",
    },
    {
      front: "DNS importance?",
      back: "Resolves names to IPs via distributed hierarchy and caching; critical for usability.",
    },
  ],
  "Distributed Systems": [
    {
      front: "CAP theorem?",
      back: "Under partition, must trade consistency vs availability; at most two of CAP.",
    },
    {
      front: "Eventual consistency?",
      back: "Replicas converge in absence of new writes; reads may be temporarily stale.",
    },
    {
      front: "What is a quorum?",
      back: "A majority or configured subset required to proceed, ensuring overlap for safety.",
    },
    {
      front: "Scale up vs out?",
      back: "Up adds resources to a node; out adds nodes, improving fault tolerance and elasticity.",
    },
    {
      front: "Distributed transaction?",
      back: "A multi-node transaction coordinated by 2PC/3PC; trades latency/availability for atomicity.",
    },
  ],
  Consensus: [
    {
      front: "What is consensus?",
      back: "Nodes agree on a value/log despite failures; aims for safety and liveness.",
    },
    {
      front: "Paxos vs Raft?",
      back: "Both leader-based; Raft emphasizes understandability; Paxos is general but complex.",
    },
    {
      front: "Failure model?",
      back: "Crash-stop and message delay/loss/reorder; not Byzantine without extensions.",
    },
    {
      front: "Leader election?",
      back: "Randomized timeouts and votes select a leader to serialize appends.",
    },
    {
      front: "Log replication?",
      back: "Ensures all correct nodes apply the same ordered operations (state machine replication).",
    },
  ],
  Raft: [
    {
      front: "Roles in Raft?",
      back: "Leader, follower, candidate with timeouts and heartbeats.",
    },
    {
      front: "Raft safety?",
      back: "Leaders must have up-to-date logs before election; committed entries preserved.",
    },
    {
      front: "Commit rule?",
      back: "Entry committed after majority replication in leader's term; then applied in order.",
    },
    {
      front: "Log compaction?",
      back: "Snapshots persist state and truncate logs to bound storage and speed recovery.",
    },
    {
      front: "Config changes?",
      back: "Joint consensus overlaps old/new configs to change membership safely.",
    },
  ],
  "Fault Tolerance": [
    {
      front: "What is fault tolerance?",
      back: "System continues operating despite failures via redundancy and recovery.",
    },
    {
      front: "Failover?",
      back: "Automatic switch to standby on failure, coordinated by health checks or consensus.",
    },
    {
      front: "Failure detectors?",
      back: "Heartbeats/timeouts infer node failure; parameters trade off accuracy/completeness.",
    },
    {
      front: "Circuit breaker?",
      back: "Stops calling failing services to allow recovery and prevent cascades.",
    },
    {
      front: "How replication helps?",
      back: "Multiple copies allow continued service during failures; needs consistency control.",
    },
  ],
  Replication: [
    {
      front: "Sync vs async replication?",
      back: "Sync waits for replicas before ack; async acks before replication (risk of loss).",
    },
    {
      front: "Leader-follower?",
      back: "Leader accepts writes and replicates to followers that can serve reads.",
    },
    {
      front: "Quorum replication?",
      back: "Overlapping read/write sets ensure consistency with tunable availability.",
    },
    {
      front: "Read-your-writes?",
      back: "Session guarantee where clients see their own writes after failover/replication.",
    },
    {
      front: "Anti-entropy?",
      back: "Background reconciliation (Merkle trees) repairs divergent replicas.",
    },
  ],
  "Game Theory": [
    {
      front: "What is a game?",
      back: "Model of strategic interaction with players, strategies, payoffs, and information.",
    },
    {
      front: "Dominant strategy?",
      back: "Yields payoff at least as good regardless of others; strictly better if strict.",
    },
    {
      front: "Mixed vs pure strategies?",
      back: "Pure picks one action; mixed randomizes over actions with probabilities.",
    },
    {
      front: "Zero-sum vs non-zero-sum?",
      back: "Zero-sum gains offset losses; non-zero-sum allows cooperation/coordination.",
    },
    {
      front: "Payoff matrix?",
      back: "Lists payoffs for action profiles; used to analyze equilibria in finite games.",
    },
  ],
  "Nash Equilibrium": [
    {
      front: "Define Nash equilibrium.",
      back: "No player can unilaterally deviate to improve payoff given others' strategies.",
    },
    {
      front: "Existence in finite games?",
      back: "Guaranteed in mixed strategies by Nash's theorem; pure may not exist.",
    },
    {
      front: "Best-response dynamics?",
      back: "Iterative best responses may converge under certain conditions.",
    },
    {
      front: "Multiple equilibria?",
      back: "Games can have multiple; selection via focal points or risk dominance.",
    },
    {
      front: "Dominant strategy vs Nash?",
      back: "Dominant is always best; Nash is mutual best responses, not necessarily dominant.",
    },
  ],
  "Prisoner's Dilemma": [
    {
      front: "What is the Prisoner's Dilemma?",
      back: "Defection strictly dominates, yet mutual cooperation is collectively better.",
    },
    {
      front: "Why defect?",
      back: "Regardless of the other's choice, defecting yields a higher individual payoff.",
    },
    {
      front: "How can cooperation emerge?",
      back: "In repeated games via strategies like Tit-for-Tat and grim trigger.",
    },
    {
      front: "Role of discount factor?",
      back: "Higher discounting of future makes cooperation more sustainable.",
    },
    {
      front: "Applications?",
      back: "Arms races, price wars, environmental agreements, network security.",
    },
  ],
  Auctions: [
    {
      front: "Auction types?",
      back: "First-price, second-price (Vickrey), English, Dutch, combinatorial.",
    },
    {
      front: "Revenue equivalence?",
      back: "With independent private values and risk neutrality, formats yield same expected revenue.",
    },
    {
      front: "Bid shading?",
      back: "Reduce bid below value in first-price to balance winning probability and payoff.",
    },
    {
      front: "Collusion risks?",
      back: "Bidders may coordinate; use reserves and activity rules to deter.",
    },
    {
      front: "Winner's curse?",
      back: "In common-value auctions, the winner tends to overestimate; bid cautiously.",
    },
  ],
  "Vickrey Auction": [
    {
      front: "Define Vickrey auction.",
      back: "Sealed-bid, second-price; highest bid wins, pays second-highest price.",
    },
    {
      front: "Truthful bidding dominant?",
      back: "Price paid is independent of your own bid given winning, so bid your value.",
    },
    {
      front: "Revenue equivalence conditions?",
      back: "Holds under independent private values, symmetry, and risk neutrality.",
    },
    {
      front: "Reserve price purpose?",
      back: "Avoid selling below value and increase expected revenue.",
    },
    {
      front: "Limitations?",
      back: "Vulnerable to shill bidding and collusion; requires audits and rules.",
    },
  ],
  "Computer Architecture": [
    {
      front: "What is a CPU pipeline?",
      back: "Stages process different instructions concurrently to increase throughput.",
    },
    {
      front: "Memory hierarchy?",
      back: "Registers → caches → DRAM → storage; trade latency, capacity, and cost.",
    },
    {
      front: "What is ILP?",
      back: "Instruction-level parallelism via pipelining, superscalar, and OoO execution.",
    },
    {
      front: "Branch predictor?",
      back: "Predicts branch outcomes to keep pipelines full; mispredictions flush work.",
    },
    {
      front: "SIMD?",
      back: "Vector operations (SSE/AVX) accelerate data-parallel workloads.",
    },
  ],
  Caches: [
    {
      front: "Why caches?",
      back: "Bridge CPU-DRAM gap using locality with small, fast memories.",
    },
    {
      front: "Mapping policies?",
      back: "Direct-mapped, set-associative, fully associative with trade-offs.",
    },
    {
      front: "Types of misses?",
      back: "Compulsory, capacity, conflict; plus coherence-related in SMPs.",
    },
    {
      front: "Write-through vs write-back?",
      back: "Through writes memory each time; back defers until eviction.",
    },
    {
      front: "Prefetching?",
      back: "Speculatively fetch data to hide memory latency (hw/sw).",
    },
  ],
  "Cache Coherence": [
    {
      front: "What is coherence?",
      back: "All processors observe consistent values for shared memory.",
    },
    {
      front: "MESI basics?",
      back: "Modified, Exclusive, Shared, Invalid states coordinate on bus/directory.",
    },
    {
      front: "Snoop vs directory?",
      back: "Snoop broadcasts on bus; directory tracks sharers for scalability.",
    },
    {
      front: "False sharing?",
      back: "Unrelated data in one line causes needless traffic on writes.",
    },
    {
      front: "Consistency vs coherence?",
      back: "Coherence for single location; consistency orders all memory ops.",
    },
  ],
  Pipelines: [
    {
      front: "Pipeline hazards?",
      back: "Structural, data (RAW/WAR/WAW), control; mitigated by stalls, fwd, renaming.",
    },
    {
      front: "Superscalar exec?",
      back: "Issue multiple instructions per cycle across units when independent.",
    },
    {
      front: "Out-of-order exec?",
      back: "Reorder execution, commit in order using ROB and reservation stations.",
    },
    {
      front: "Reorder buffer role?",
      back: "Holds speculative results for precise exceptions and rollback.",
    },
    {
      front: "Speculation security?",
      back: "Spectre/Meltdown leak via caches; mitigations include fencing/retpolines.",
    },
  ],
  "Out-of-Order Execution": [
    {
      front: "Why register renaming?",
      back: "Eliminates WAR/WAW by mapping to more physical registers.",
    },
    {
      front: "Tomasulo's algorithm?",
      back: "Dynamic scheduling with reservation stations and common data bus.",
    },
    {
      front: "Tracking dependencies?",
      back: "Rename tables and wakeup/select track readiness and schedule issue.",
    },
    {
      front: "What ends speculation?",
      back: "Commit stage validates results; mispredicts cause pipeline flush.",
    },
    {
      front: "Latency hiding?",
      back: "Deep pipelines, prefetching, SMT, and larger windows increase overlap.",
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
