import { describe, expect, it } from "vitest";
import { Card } from "./cards";
import {
  continueAfterCompletedTrick,
  createTrickRound,
  getPenaltyForTrick,
  playBotsUntilHumanTurn,
  playCard,
  settleRoundPenalties,
  TrickRoundState,
} from "./trickRound";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("trick round scoring", () => {
  it("scores red cards in Cervene", () => {
    const penalty = getPenaltyForTrick("cervene", [
      { playerId: 0, card: card("7", "cervene") },
      { playerId: 1, card: card("kral", "kule") },
      { playerId: 2, card: card("eso", "cervene") },
      { playerId: 3, card: card("8", "zaludy") },
    ]);

    expect(penalty).toBe(2);
  });

  it("scores every Svrsek in Filky regardless of suit", () => {
    const penalty = getPenaltyForTrick("filky", [
      { playerId: 0, card: card("svrsek", "cervene") },
      { playerId: 1, card: card("svrsek", "kule") },
      { playerId: 2, card: card("eso", "cervene") },
      { playerId: 3, card: card("8", "zaludy") },
    ]);

    expect(penalty).toBe(4);
  });

  it("scores only the red king in Kral", () => {
    expect(
      getPenaltyForTrick("kral", [
        { playerId: 0, card: card("kral", "cervene") },
        { playerId: 1, card: card("kral", "kule") },
      ]),
    ).toBe(8);
    expect(getPenaltyForTrick("kral", [{ playerId: 0, card: card("kral", "kule") }])).toBe(0);
  });

  it("scores every trick in Stychy", () => {
    expect(getPenaltyForTrick("stychy", [{ playerId: 0, card: card("7", "cervene") }])).toBe(1);
  });

  it("settles round penalties against player money", () => {
    const state = {
      players: [
        { id: 0, name: "Ty", isHuman: true, money: 50 },
        { id: 1, name: "Bot", isHuman: false, money: 50 },
      ],
      penalties: [3, 5],
    } as TrickRoundState;

    expect(settleRoundPenalties(state).map((player) => player.money)).toEqual([47, 45]);
  });

  it("keeps the last completed trick visible in round state", () => {
    let state = createTrickRound({
      type: "cervene",
      players: [
        { id: 0, name: "Ty", isHuman: true, money: 50 },
        { id: 1, name: "Bot 1", isHuman: false, money: 50 },
        { id: 2, name: "Bot 2", isHuman: false, money: 50 },
        { id: 3, name: "Bot 3", isHuman: false, money: 50 },
      ],
      dealer: 3,
      bank: 0,
      random: () => 0,
    });

    state = {
      ...state,
      currentPlayer: 0,
      hands: [
        [card("7", "cervene"), card("7", "kule")],
        [card("8", "cervene"), card("8", "kule")],
        [card("9", "cervene"), card("9", "kule")],
        [card("10", "cervene"), card("10", "kule")],
      ],
    };

    state = playCard(state, 0, card("7", "cervene"));
    state = playCard(state, 1, card("8", "cervene"));
    state = playCard(state, 2, card("9", "cervene"));
    state = playCard(state, 3, card("10", "cervene"));

    expect(state.trick).toEqual([]);
    expect(state.completedTricks).toHaveLength(1);
    expect(state.completedTricks[0].map((played) => played.playerId)).toEqual([0, 1, 2, 3]);
    expect(state.awaitingNextTrick).toBe(true);
  });

  it("pauses after bots finish a trick so played cards remain visible", () => {
    let state = createTrickRound({
      type: "kral",
      players: [
        { id: 0, name: "Ty", isHuman: true, money: 50 },
        { id: 1, name: "Bot 1", isHuman: false, money: 50 },
        { id: 2, name: "Bot 2", isHuman: false, money: 50 },
        { id: 3, name: "Bot 3", isHuman: false, money: 50 },
      ],
      dealer: 3,
      bank: 16,
      random: () => 0,
    });

    state = {
      ...state,
      currentPlayer: 0,
      hands: [
        [card("8", "cervene"), card("7", "kule")],
        [card("9", "cervene"), card("8", "kule")],
        [card("10", "cervene"), card("9", "kule")],
        [card("spodek", "cervene"), card("10", "kule")],
      ],
    };

    state = playBotsUntilHumanTurn(playCard(state, 0, card("8", "cervene")));

    expect(state.awaitingNextTrick).toBe(true);
    expect(state.trick).toEqual([]);
    expect(state.completedTricks).toHaveLength(1);

    const continuedState = playBotsUntilHumanTurn(continueAfterCompletedTrick(state));

    expect(continuedState.awaitingNextTrick).toBe(false);
    expect(continuedState.currentPlayer).toBe(0);
  });
});
