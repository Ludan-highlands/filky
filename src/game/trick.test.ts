import { describe, expect, it } from "vitest";
import { Card } from "./cards";
import { getCurrentTrickWinner, getLegalCards, getTrickPenaltyForRedCards } from "./trick";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("trick rules", () => {
  it("requires following the lead suit when possible", () => {
    const hand = [card("7", "kule"), card("eso", "cervene"), card("spodek", "kule")];
    const legalCards = getLegalCards(hand, [{ playerId: 1, card: card("10", "kule") }]);

    expect(legalCards).toEqual([card("7", "kule"), card("spodek", "kule")]);
  });

  it("allows any card when player cannot follow the lead suit", () => {
    const hand = [card("eso", "cervene"), card("spodek", "zelene")];
    const legalCards = getLegalCards(hand, [{ playerId: 1, card: card("10", "kule") }]);

    expect(legalCards).toEqual(hand);
  });

  it("gives the trick to the strongest card in the lead suit", () => {
    const winner = getCurrentTrickWinner([
      { playerId: 1, card: card("10", "kule") },
      { playerId: 2, card: card("eso", "cervene") },
      { playerId: 3, card: card("kral", "kule") },
      { playerId: 0, card: card("7", "kule") },
    ]);

    expect(winner?.playerId).toBe(3);
  });

  it("counts only red cards as penalties in Cervene", () => {
    const penalty = getTrickPenaltyForRedCards([
      { playerId: 1, card: card("10", "kule") },
      { playerId: 2, card: card("eso", "cervene") },
      { playerId: 3, card: card("kral", "cervene") },
      { playerId: 0, card: card("7", "zaludy") },
    ]);

    expect(penalty).toBe(2);
  });
});
