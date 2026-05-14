import { Card, compareCards, createDeck, isSameCard, shuffleDeck, sortHand } from "./cards";
import { advancePlayer, nextPlayer, Player } from "./players";
import { getCurrentTrickWinner, getLegalCards, PlayedCard, removeCardFromHand } from "./trick";

export const trickRoundTypes = ["cervene", "filky", "kral", "stychy"] as const;

export type TrickRoundType = (typeof trickRoundTypes)[number];

export interface TrickRoundState {
  type: TrickRoundType;
  players: Player[];
  dealer: number;
  leader: number;
  currentPlayer: number;
  hands: Card[][];
  trick: PlayedCard[];
  completedTricks: PlayedCard[][];
  takenCards: Card[][];
  penalties: number[];
  bank: number;
  finished: boolean;
  awaitingNextTrick: boolean;
  message: string;
}

export function createTrickRound(options: {
  type: TrickRoundType;
  players: Player[];
  dealer: number;
  bank: number;
  random?: () => number;
}): TrickRoundState {
  const random = options.random ?? Math.random;
  const leader = nextPlayer(options.dealer);
  const hands = dealCards(shuffleDeck(createDeck(), random));

  return {
    type: options.type,
    players: options.players,
    dealer: options.dealer,
    leader,
    currentPlayer: leader,
    hands,
    trick: [],
    completedTricks: [],
    takenCards: [[], [], [], []],
    penalties: [0, 0, 0, 0],
    bank: options.bank,
    finished: false,
    awaitingNextTrick: false,
    message: `${options.players[leader].name} vynáší první štych kola ${getRoundTitle(options.type)}.`,
  };
}

export function createNextTrickRound(state: TrickRoundState, random = Math.random): TrickRoundState | null {
  const currentIndex = trickRoundTypes.indexOf(state.type);
  const nextType = trickRoundTypes[currentIndex + 1];

  if (!nextType) {
    return null;
  }

  return createTrickRound({
    type: nextType,
    players: settleRoundPenalties(state),
    dealer: advancePlayer(state.dealer, 1),
    bank: state.bank,
    random,
  });
}

export function dealCards(deck: Card[]): Card[][] {
  const hands: Card[][] = [[], [], [], []];

  deck.forEach((card, index) => {
    hands[index % 4].push(card);
  });

  return hands.map(sortHand);
}

export function playHumanCard(state: TrickRoundState, card: Card): TrickRoundState {
  if (state.finished || state.currentPlayer !== 0) {
    return state;
  }

  return playCard(state, 0, card);
}

export function playCard(state: TrickRoundState, playerId: number, card: Card): TrickRoundState {
  if (state.finished || state.awaitingNextTrick) {
    return state;
  }

  if (state.currentPlayer !== playerId) {
    return {
      ...state,
      message: `Teď je na tahu ${state.players[state.currentPlayer].name}.`,
    };
  }

  if (!isLegalPlay(state, playerId, card)) {
    return {
      ...state,
      message: "Tuhle kartu teď zahrát nemůžeš, musíš ctít vynesenou barvu.",
    };
  }

  const hands = state.hands.map((hand, index) => (index === playerId ? sortHand(removeCardFromHand(hand, card)) : hand));
  const trick = [...state.trick, { playerId, card }];

  if (trick.length === 4) {
    return finishTrick({
      ...state,
      hands,
      trick,
    });
  }

  const currentPlayer = nextPlayer(playerId);
  const currentWinner = getCurrentTrickWinner(trick);

  return {
    ...state,
    hands,
    trick,
    currentPlayer,
    message: `${state.players[currentPlayer].name} je na tahu. Aktuálně bere ${
      state.players[currentWinner?.playerId ?? playerId].name
    }.`,
  };
}

export function isLegalPlay(state: TrickRoundState, playerId: number, card: Card): boolean {
  const hand = state.hands[playerId];
  const legalCards = getLegalCards(hand, state.trick);
  return legalCards.some((legalCard) => isSameCard(legalCard, card));
}

export function playBotsUntilHumanTurn(state: TrickRoundState): TrickRoundState {
  let nextState = state;
  let guard = 0;

  while (!nextState.finished && !nextState.awaitingNextTrick && nextState.currentPlayer !== 0 && guard < 32) {
    const playerId = nextState.currentPlayer;
    const card = chooseBotCard(nextState, playerId);
    nextState = playCard(nextState, playerId, card);
    guard += 1;
  }

  return nextState;
}

export function continueAfterCompletedTrick(state: TrickRoundState): TrickRoundState {
  if (state.finished || !state.awaitingNextTrick) {
    return state;
  }

  return {
    ...state,
    awaitingNextTrick: false,
    message: `${state.players[state.currentPlayer].name} vynáší další štych.`,
  };
}

export function chooseBotCard(state: TrickRoundState, playerId: number): Card {
  const legalCards = getLegalCards(state.hands[playerId], state.trick);
  const noPenaltyCards = legalCards.filter((card) => getSingleCardRisk(state.type, card) === 0);

  if (state.trick.length === 0) {
    return lowestCard(noPenaltyCards.length > 0 ? noPenaltyCards : legalCards);
  }

  const safeCards = legalCards.filter((card) => !wouldCardCurrentlyWin(state.trick, card));

  if (safeCards.length > 0) {
    const safeWithoutPenalty = safeCards.filter((card) => getSingleCardRisk(state.type, card) === 0);
    return highestCard(safeWithoutPenalty.length > 0 ? safeWithoutPenalty : safeCards);
  }

  return lowestCard(noPenaltyCards.length > 0 ? noPenaltyCards : legalCards);
}

export function getRoundTitle(type: TrickRoundType): string {
  const titles: Record<TrickRoundType, string> = {
    cervene: "Červené",
    filky: "Filky",
    kral: "Král",
    stychy: "Štychy",
  };

  return titles[type];
}

export function getPenaltyForTrick(type: TrickRoundType, trick: PlayedCard[]): number {
  if (type === "cervene") {
    return trick.filter((played) => played.card.suit === "cervene").length;
  }

  if (type === "filky") {
    return trick.filter((played) => played.card.rank === "svrsek").length * 2;
  }

  if (type === "kral") {
    return trick.some((played) => played.card.suit === "cervene" && played.card.rank === "kral") ? 8 : 0;
  }

  return 1;
}

export function settleRoundPenalties(state: TrickRoundState): Player[] {
  return state.players.map((player, index) => ({
    ...player,
    money: player.money - state.penalties[index],
  }));
}

function finishTrick(state: TrickRoundState): TrickRoundState {
  const winner = getCurrentTrickWinner(state.trick);

  if (!winner) {
    throw new Error("Cannot finish an empty trick.");
  }

  const penalty = getPenaltyForTrick(state.type, state.trick);
  const penalties = state.penalties.map((value, index) => (index === winner.playerId ? value + penalty : value));
  const takenCards = state.takenCards.map((cards, index) =>
    index === winner.playerId ? [...cards, ...state.trick.map((played) => played.card)] : cards,
  );
  const bank = state.bank + penalty;
  const finished = state.hands.every((hand) => hand.length === 0);

  return {
    ...state,
    leader: winner.playerId,
    currentPlayer: winner.playerId,
    trick: [],
    completedTricks: [...state.completedTricks, state.trick],
    takenCards,
    penalties,
    bank,
    finished,
    awaitingNextTrick: !finished,
    message: finished
      ? `Kolo ${getRoundTitle(state.type)} skončilo. Bank: ${bank} Kč.`
      : `${state.players[winner.playerId].name} bere štych za ${penalty} Kč a vynáší další.`,
  };
}

function getSingleCardRisk(type: TrickRoundType, card: Card): number {
  if (type === "cervene" && card.suit === "cervene") {
    return 1;
  }

  if (type === "filky" && card.rank === "svrsek") {
    return 2;
  }

  if (type === "kral" && card.suit === "cervene" && card.rank === "kral") {
    return 8;
  }

  return 0;
}

function wouldCardCurrentlyWin(trick: PlayedCard[], card: Card): boolean {
  const leadSuit = trick[0]?.card.suit;

  if (!leadSuit || card.suit !== leadSuit) {
    return false;
  }

  const currentWinner = getCurrentTrickWinner(trick);
  return !currentWinner || compareCards(card, currentWinner.card) > 0;
}

function lowestCard(cards: Card[]): Card {
  return [...cards].sort(compareCards)[0];
}

function highestCard(cards: Card[]): Card {
  return [...cards].sort(compareCards).at(-1) ?? cards[0];
}
