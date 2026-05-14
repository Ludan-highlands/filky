import { describe, expect, it } from "vitest";
import { Card } from "./cards";
import {
  LayingRoundState,
  getPayoutsByPlayer,
  isLegalCardForRows,
  payOutBank,
  playLayingBotsUntilHumanTurn,
} from "./layingRound";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("laying round", () => {
  it("starts every suit only with Spodek", () => {
    expect(isLegalCardForRows({}, card("spodek", "cervene"))).toBe(true);
    expect(isLegalCardForRows({}, card("10", "cervene"))).toBe(false);
  });

  it("allows placing only adjacent cards in an existing suit row", () => {
    const rows = {
      cervene: {
        suit: "cervene" as const,
        low: "spodek" as const,
        high: "svrsek" as const,
      },
    };

    expect(isLegalCardForRows(rows, card("10", "cervene"))).toBe(true);
    expect(isLegalCardForRows(rows, card("kral", "cervene"))).toBe(true);
    expect(isLegalCardForRows(rows, card("eso", "cervene"))).toBe(false);
  });

  it("pays the bank by fixed local rules", () => {
    const players = [
      { id: 0, name: "Ty", isHuman: true, money: 20 },
      { id: 1, name: "Bot 1", isHuman: false, money: 20 },
      { id: 2, name: "Bot 2", isHuman: false, money: 20 },
      { id: 3, name: "Bot 3", isHuman: false, money: 20 },
    ];

    expect(payOutBank(players, [2, 0, 3, 1]).map((player) => player.money)).toEqual([30, 20, 36, 26]);
    expect(getPayoutsByPlayer([2, 0, 3, 1])).toEqual([10, 0, 16, 6]);
  });

  it("automatically skips the human player when they have no legal laying card", () => {
    const state = {
      type: "vykladani",
      players: [
        { id: 0, name: "Ty", isHuman: true, money: 50 },
        { id: 1, name: "Bot 1", isHuman: false, money: 50 },
        { id: 2, name: "Bot 2", isHuman: false, money: 50 },
        { id: 3, name: "Bot 3", isHuman: false, money: 50 },
      ],
      dealer: 3,
      currentPlayer: 0,
      hands: [
        [card("8", "cervene")],
        [card("10", "cervene")],
        [card("9", "cervene")],
        [card("7", "zelene")],
      ],
      rows: {
        cervene: {
          suit: "cervene",
          low: "spodek",
          high: "spodek",
        },
      },
      finishedOrder: [],
      passedPlayers: [],
      payouts: [0, 0, 0, 0],
      bank: 32,
      finished: false,
      message: "Ty zacinas.",
    } satisfies LayingRoundState;

    const nextState = playLayingBotsUntilHumanTurn(state);

    expect(nextState.currentPlayer).toBe(0);
    expect(nextState.passedPlayers).toContain(0);
    expect(nextState.hands[0]).toEqual([card("8", "cervene")]);
  });
});
