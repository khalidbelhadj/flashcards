import { CardsRow, Rating } from "src/lib/schema";

export type Minutes = number;

/**
 * SM-2 algorithm adapted for 4 ratings:
 *   forgot (0) → lapse, reset to learning
 *   hard   (1) → correct but difficult
 *   good   (2) → normal correct
 *   easy   (3) → effortless
 *
 * Ease factor is stored as EF * 1000 (integer) to avoid floating point in SQLite.
 */

const MIN_EF = 1300; // 1.3

// SM-2 ease factor adjustment mapped to 4 ratings.
// Original SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
// We map: forgot→q=1, hard→q=3, good→q=4, easy→q=5
const EF_DELTA: Record<Rating, number> = {
  forgot: -540, // q=1: heavy penalty (but card also resets)
  hard: -140, // q=3: slight decrease
  good: 0, // q=4: no change
  easy: 100, // q=5: gets easier
};

// Learning steps (in minutes) for new/lapsed cards
const LEARNING_STEPS: Minutes[] = [1, 10];

// "Graduating" interval — first interval after leaving learning
const GRADUATING_INTERVAL: Minutes = 1 * 24 * 60; // 1 day
// Easy bonus graduating interval
const EASY_GRADUATING_INTERVAL: Minutes = 4 * 24 * 60; // 4 days

export interface ScheduleResult {
  interval: Minutes;
  easeFactor: number;
  n: number;
  status: CardsRow["status"];
}

export function schedule(card: CardsRow, rating: Rating): ScheduleResult {
  const ef = card.easeFactor;
  const { n, status } = card;

  // --- Lapse: card forgotten ---
  if (rating === "forgot") {
    return {
      interval: LEARNING_STEPS[0],
      easeFactor: Math.max(MIN_EF, ef + EF_DELTA.forgot),
      n: 0,
      status: "learning",
    };
  }

  // --- New or learning cards ---
  if (status === "new" || status === "learning") {
    // Easy during learning → graduate immediately with bonus
    if (rating === "easy") {
      return {
        interval: EASY_GRADUATING_INTERVAL,
        easeFactor: Math.max(MIN_EF, ef + EF_DELTA.easy),
        n: n + 1,
        status: "reviewing",
      };
    }

    // Still in learning steps
    if (n < LEARNING_STEPS.length - 1) {
      return {
        interval: LEARNING_STEPS[n + 1] ?? LEARNING_STEPS[LEARNING_STEPS.length - 1],
        easeFactor: Math.max(MIN_EF, ef + EF_DELTA[rating]),
        n: n + 1,
        status: "learning",
      };
    }

    // Completed learning steps → graduate
    return {
      interval: GRADUATING_INTERVAL,
      easeFactor: Math.max(MIN_EF, ef + EF_DELTA[rating]),
      n: n + 1,
      status: "reviewing",
    };
  }

  // --- Reviewing cards (graduated) ---
  const newEF = Math.max(MIN_EF, ef + EF_DELTA[rating]);

  let newInterval: Minutes;
  const prevInterval = card.interval;

  if (rating === "hard") {
    // Hard: interval * 1.2 (slower growth)
    newInterval = Math.max(prevInterval + 1, Math.round(prevInterval * 1.2));
  } else if (rating === "easy") {
    // Easy: interval * EF * 1.3 (bonus)
    newInterval = Math.max(
      prevInterval + 1,
      Math.round((prevInterval * newEF * 1.3) / 1000),
    );
  } else {
    // Good: interval * EF
    newInterval = Math.max(
      prevInterval + 1,
      Math.round((prevInterval * newEF) / 1000),
    );
  }

  return {
    interval: newInterval,
    easeFactor: newEF,
    n: n + 1,
    status: "reviewing",
  };
}
