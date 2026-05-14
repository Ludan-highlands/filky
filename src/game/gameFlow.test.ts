import { describe, expect, it } from "vitest";
import { createFollowingGame } from "./gameFlow";

describe("game flow", () => {
  it("continues the next game with preserved money and dealer left of previous first dealer", () => {
    const players = [
      { id: 0, name: "Ty", isHuman: true, money: 64 },
      { id: 1, name: "Bot 1", isHuman: false, money: 41 },
      { id: 2, name: "Bot 2", isHuman: false, money: 52 },
      { id: 3, name: "Bot 3", isHuman: false, money: 43 },
    ];

    const nextGame = createFollowingGame({
      players,
      previousFirstDealer: 2,
      random: () => 0,
    });

    expect(nextGame.type).toBe("cervene");
    expect(nextGame.dealer).toBe(3);
    expect(nextGame.players.map((player) => player.money)).toEqual([64, 41, 52, 43]);
  });
});
