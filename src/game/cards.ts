export const suits = ["cervene", "kule", "zelene", "zaludy"] as const;
export const ranks = ["7", "8", "9", "10", "spodek", "svrsek", "kral", "eso"] as const;

export type Suit = (typeof suits)[number];
export type Rank = (typeof ranks)[number];

export interface Card {
  suit: Suit;
  rank: Rank;
}

export function createDeck(): Card[] {
  return suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
}

export function cardId(card: Card): string {
  return `${card.rank}-${card.suit}`;
}

export function cardLabel(card: Card): string {
  const rankLabels: Record<Rank, string> = {
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    spodek: "Spodek",
    svrsek: "Svrsek",
    kral: "Kral",
    eso: "Eso",
  };

  return `${rankLabels[card.rank]} ${card.suit}`;
}

export function rankStrength(rank: Rank): number {
  return ranks.indexOf(rank);
}

export function compareCards(a: Card, b: Card): number {
  return rankStrength(a.rank) - rankStrength(b.rank);
}

export function isSameCard(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

export function shuffleDeck(deck: Card[], random = Math.random): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const suitDiff = suits.indexOf(a.suit) - suits.indexOf(b.suit);
    return suitDiff || compareCards(a, b);
  });
}
