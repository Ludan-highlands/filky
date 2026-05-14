import { Card, createDeck, isSameCard, Rank, ranks, shuffleDeck, sortHand, Suit, suits } from "./cards";
import { advancePlayer, nextPlayer, Player } from "./players";
import { dealCards } from "./trickRound";

export interface LayingRow {
  suit: Suit;
  low: Rank;
  high: Rank;
}

export interface LayingRoundState {
  type: "vykladani";
  players: Player[];
  dealer: number;
  currentPlayer: number;
  hands: Card[][];
  rows: Partial<Record<Suit, LayingRow>>;
  finishedOrder: number[];
  passedPlayers: number[];
  payouts: number[];
  bank: number;
  finished: boolean;
  message: string;
}

export function createLayingRound(options: {
  players: Player[];
  dealer: number;
  bank: number;
  random?: () => number;
}): LayingRoundState {
  const random = options.random ?? Math.random;
  const hands = dealCards(shuffleDeck(createDeck(), random));
  const currentPlayer = nextPlayer(options.dealer);

  return {
    type: "vykladani",
    players: options.players,
    dealer: options.dealer,
    currentPlayer,
    hands,
    rows: {},
    finishedOrder: [],
    passedPlayers: [],
    payouts: [0, 0, 0, 0],
    bank: options.bank,
    finished: false,
    message: `${options.players[currentPlayer].name} zacina Vykladani.`,
  };
}

export function playHumanLayingCard(state: LayingRoundState, card: Card): LayingRoundState {
  if (state.finished || state.currentPlayer !== 0) {
    return state;
  }

  return playLayingCard(state, 0, card);
}

export function passHumanLayingTurn(state: LayingRoundState): LayingRoundState {
  if (state.finished || state.currentPlayer !== 0) {
    return state;
  }

  return passLayingTurn(state, 0);
}

export function playLayingCard(state: LayingRoundState, playerId: number, card: Card): LayingRoundState {
  if (state.finished) {
    return state;
  }

  if (state.currentPlayer !== playerId) {
    return {
      ...state,
      message: `Ted je na tahu ${state.players[state.currentPlayer].name}.`,
    };
  }

  if (!isLegalLayingPlay(state, playerId, card)) {
    return {
      ...state,
      message: "Tuhle kartu ted nelze vylozit.",
    };
  }

  const hands = state.hands.map((hand, index) =>
    index === playerId ? sortHand(removeCardFromHand(hand, card)) : hand,
  );
  const rows = placeCard(state.rows, card);
  const orderAfterPlay = hands[playerId].length === 0 ? [...state.finishedOrder, playerId] : state.finishedOrder;
  const finishedOrder =
    orderAfterPlay.length === state.players.length - 1
      ? [...orderAfterPlay, state.players.find((player) => !orderAfterPlay.includes(player.id))?.id ?? playerId]
      : orderAfterPlay;
  const finished = finishedOrder.length === state.players.length;
  const payouts = finished ? getPayoutsByPlayer(finishedOrder) : state.payouts;
  const players = finished ? payOutBank(state.players, finishedOrder) : state.players;

  if (finished) {
    return {
      ...state,
      players,
      hands,
      rows,
      finishedOrder,
      payouts,
      finished,
      bank: 0,
      message: "Vykladani skoncilo. Bank byl rozdelen.",
    };
  }

  const currentPlayer = getNextActivePlayer(nextPlayer(playerId), finishedOrder);

  return {
    ...state,
    hands,
    rows,
    finishedOrder,
    passedPlayers: state.passedPlayers.filter((id) => id !== playerId),
    currentPlayer,
    message: `${state.players[playerId].name} vylozil ${card.rank} ${card.suit}. Na tahu je ${state.players[currentPlayer].name}.`,
  };
}

export function passLayingTurn(state: LayingRoundState, playerId: number): LayingRoundState {
  if (state.finished) {
    return state;
  }

  if (state.currentPlayer !== playerId) {
    return {
      ...state,
      message: `Ted je na tahu ${state.players[state.currentPlayer].name}.`,
    };
  }

  if (getLegalLayingCards(state, playerId).length > 0) {
    return {
      ...state,
      message: "Stojis jen tehdy, kdyz nemas zadnou platnou kartu.",
    };
  }

  const passedPlayers = state.passedPlayers.includes(playerId) ? state.passedPlayers : [...state.passedPlayers, playerId];
  const currentPlayer = getNextActivePlayer(nextPlayer(playerId), state.finishedOrder);

  return {
    ...state,
    passedPlayers,
    currentPlayer,
    message: `${state.players[playerId].name} stoji. Na tahu je ${state.players[currentPlayer].name}.`,
  };
}

export function playLayingBotsUntilHumanTurn(state: LayingRoundState): LayingRoundState {
  let nextState = state;
  let guard = 0;

  while (!nextState.finished && guard < 64) {
    const playerId = nextState.currentPlayer;
    const legalCards = getLegalLayingCards(nextState, playerId);

    if (playerId === 0 && legalCards.length > 0) {
      break;
    }

    if (legalCards.length === 0) {
      nextState = passLayingTurn(nextState, playerId);
      guard += 1;
      continue;
    }

    nextState = playLayingCard(nextState, playerId, chooseLayingBotCard(nextState, playerId));
    guard += 1;
  }

  return nextState;
}

export function getLegalLayingCards(state: LayingRoundState, playerId: number): Card[] {
  return state.hands[playerId].filter((card) => isLegalCardForRows(state.rows, card));
}

export function isLegalLayingPlay(state: LayingRoundState, playerId: number, card: Card): boolean {
  return getLegalLayingCards(state, playerId).some((legalCard) => isSameCard(legalCard, card));
}

export function isLegalCardForRows(rows: Partial<Record<Suit, LayingRow>>, card: Card): boolean {
  const row = rows[card.suit];

  if (!row) {
    return card.rank === "spodek";
  }

  const rankIndex = ranks.indexOf(card.rank);
  return rankIndex === ranks.indexOf(row.low) - 1 || rankIndex === ranks.indexOf(row.high) + 1;
}

export function payOutBank(players: Player[], finishedOrder: number[]): Player[] {
  const payouts = getPayoutsByPlayer(finishedOrder);

  return players.map((player) => {
    return {
      ...player,
      money: player.money + payouts[player.id],
    };
  });
}

export function getPayoutsByPlayer(finishedOrder: number[]): number[] {
  const payoutsByPlace = [16, 10, 6, 0];
  const payoutsByPlayer = [0, 0, 0, 0];

  finishedOrder.forEach((playerId, placeIndex) => {
    payoutsByPlayer[playerId] = payoutsByPlace[placeIndex] ?? 0;
  });

  return payoutsByPlayer;
}

function placeCard(rows: Partial<Record<Suit, LayingRow>>, card: Card): Partial<Record<Suit, LayingRow>> {
  const row = rows[card.suit];

  if (!row) {
    return {
      ...rows,
      [card.suit]: {
        suit: card.suit,
        low: card.rank,
        high: card.rank,
      },
    };
  }

  return {
    ...rows,
    [card.suit]: {
      ...row,
      low: ranks.indexOf(card.rank) < ranks.indexOf(row.low) ? card.rank : row.low,
      high: ranks.indexOf(card.rank) > ranks.indexOf(row.high) ? card.rank : row.high,
    },
  };
}

function chooseLayingBotCard(state: LayingRoundState, playerId: number): Card {
  const legalCards = getLegalLayingCards(state, playerId);
  const nonSpodky = legalCards.filter((card) => card.rank !== "spodek");
  return sortHand(nonSpodky.length > 0 ? nonSpodky : legalCards)[0];
}

function getNextActivePlayer(startPlayer: number, finishedOrder: number[]): number {
  let playerId = startPlayer;

  while (finishedOrder.includes(playerId)) {
    playerId = nextPlayer(playerId);
  }

  return playerId;
}

function removeCardFromHand(hand: Card[], card: Card): Card[] {
  const index = hand.findIndex((candidate) => isSameCard(candidate, card));

  if (index === -1) {
    throw new Error("Card is not in hand.");
  }

  return [...hand.slice(0, index), ...hand.slice(index + 1)];
}

export function getNextGameFirstDealer(layingDealer: number): number {
  return advancePlayer(layingDealer, 1);
}

export function getLayingRowsForDisplay(rows: Partial<Record<Suit, LayingRow>>): LayingRow[] {
  return suits.map((suit) => rows[suit] ?? { suit, low: "spodek", high: "spodek" });
}
