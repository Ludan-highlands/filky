import { describe, expect, it } from "vitest";
import { createDeck, ranks, suits } from "./cards";

describe("cards", () => {
  it("creates a 32-card mariase deck", () => {
    const deck = createDeck();

    expect(deck).toHaveLength(32);
    expect(new Set(deck.map((card) => `${card.rank}-${card.suit}`))).toHaveLength(32);
    expect(suits).toEqual(["cervene", "kule", "zelene", "zaludy"]);
    expect(ranks).toEqual(["7", "8", "9", "10", "spodek", "svrsek", "kral", "eso"]);
  });
});
