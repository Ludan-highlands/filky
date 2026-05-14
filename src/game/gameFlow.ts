import { createPlayers, nextPlayer, Player } from "./players";
import { createTrickRound, playBotsUntilHumanTurn, TrickRoundState } from "./trickRound";

export function createInitialGame(random = Math.random): TrickRoundState {
  const players = createPlayers();
  const dealer = Math.floor(random() * players.length);

  return playBotsUntilHumanTurn(
    createTrickRound({
      type: "cervene",
      players,
      dealer,
      bank: 0,
      random,
    }),
  );
}

export function createFollowingGame(options: {
  players: Player[];
  previousFirstDealer: number;
  random?: () => number;
}): TrickRoundState {
  return playBotsUntilHumanTurn(
    createTrickRound({
      type: "cervene",
      players: options.players,
      dealer: nextPlayer(options.previousFirstDealer),
      bank: 0,
      random: options.random,
    }),
  );
}
