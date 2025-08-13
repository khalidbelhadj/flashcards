import { CardsRow, ReviewsRow } from "src/lib/schema";

export type Minutes = number;
type Rating = ReviewsRow["rating"];

const ratingToNumber = (rating: Rating): number => {
  switch (rating) {
    case "forgot":
      return 0;
    case "hard":
      return 1;
    case "good":
      return 2;
    case "easy":
      return 3;
  }
};

function seconds(n: number): Minutes {
  return n / 60;
}

function minutes(n: number): Minutes {
  return n;
}

function hours(n: number): Minutes {
  return n * 60;
}

function days(n: number): Minutes {
  return n * 60 * 24;
}

function weeks(n: number): Minutes {
  return n * 60 * 24 * 7;
}

function months(n: number): Minutes {
  return n * 60 * 24 * 30;
}

const next: Minutes[] = [minutes(1), hours(1), days(1), weeks(1), months(1)];

export async function schedule(
  card: CardsRow,
  rating: Rating,
): Promise<Minutes> {
  const { n } = card;
  return next[Math.min(n, next.length - 1)];
}
