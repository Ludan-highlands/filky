import { Card, compareCards, isSameCard, Suit } from "./cards";

export interface PlayedCard {
  playerId: number;
  card: Card;
}

export function getLeadSuit(trick: PlayedCard[]): Suit | null {
  return trick[0]?.card.suit ?? null;
}

export function getLegalCards(hand: Card[], trick: PlayedCard[]): Card[] {
  const leadSuit = getLeadSuit(trick);

  if (!leadSuit) {
    return hand;
  }

  const followingCards = hand.filter((card) => card.suit === leadSuit);
  return followingCards.length > 0 ? followingCards : hand;
}

export function getCurrentTrickWinner(trick: PlayedCard[]): PlayedCard | null {
  const leadSuit = getLeadSuit(trick);

  if (!leadSuit) {
    return null;
  }

  return trick
    .filter((played) => played.card.suit === leadSuit)
    .reduce((winner, played) => (compareCards(played.card, winner.card) > 0 ? played : winner));
}

export function getTrickPenaltyForRedCards(trick: PlayedCard[]): number {
  return trick.filter((played) => played.card.suit === "cervene").length;
}

export function removeCardFromHand(hand: Card[], card: Card): Card[] {
  const index = hand.findIndex((candidate) => isSameCard(candidate, card));

  if (index === -1) {
    throw new Error("Card is not in hand.");
  }

  return [...hand.slice(0, index), ...hand.slice(index + 1)];
}
