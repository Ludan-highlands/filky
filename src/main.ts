import "./styles.css";
import { cardId, cardLabel, Card, Rank, ranks, Suit, suits } from "./game/cards";
import {
  chooseBotCard,
  continueAfterCompletedTrick,
  createNextTrickRound,
  getRoundTitle,
  playCard,
  playHumanCard,
  settleRoundPenalties,
  TrickRoundState,
} from "./game/trickRound";
import { createFollowingGame, createInitialGame } from "./game/gameFlow";
import { createPlayers } from "./game/players";
import { getCurrentTrickWinner, getLegalCards } from "./game/trick";
import {
  chooseLayingBotCard,
  createLayingRound,
  getLegalLayingCards,
  LayingRoundState,
  passLayingTurn,
  playHumanLayingCard,
  playLayingCard,
} from "./game/layingRound";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("App root is missing.");
}

const app = appRoot;
type GameUiState = TrickRoundState | LayingRoundState;

let state: GameUiState = createInitialUiState();
let botTurnTimer: number | undefined;
let highlightedPlayerId: number | null = null;

function createInitialUiState(): GameUiState {
  const params = new URLSearchParams(window.location.search);

  if (params.get("round") === "vykladani") {
    return createLayingRound({
      players: createPlayers(),
      dealer: 3,
      bank: 32,
    });
  }

  return createInitialGame();
}

function render(): void {
  if (state.type === "vykladani") {
    renderLayingRound(state);
    return;
  }

  renderTrickRound(state);
}

function renderTrickRound(roundState: TrickRoundState): void {
  const currentWinner = getCurrentTrickWinner(roundState.trick);
  const displayedTrick = roundState.trick.length > 0 ? roundState.trick : (roundState.completedTricks.at(-1) ?? []);
  const displayedWinner = roundState.trick.length > 0 ? currentWinner : getCurrentTrickWinner(displayedTrick);
  app.innerHTML = `
    <main class="table table-trick">
      <header class="topbar">
        <div class="brand">
          <h1>Filky</h1>
          <span>Kolo: ${getRoundTitle(roundState.type)}</span>
        </div>
        <div class="status">
          <strong>Bank: ${roundState.bank} Kč</strong>
          <span>Tvoje peníze: ${roundState.players[0].money - roundState.penalties[0]} Kč</span>
          <span>Rozdává: ${roundState.players[roundState.dealer].name}</span>
        </div>
        <button class="secondary" data-action="new-game">Nová hra</button>
      </header>

      <section class="tabletop">
        ${renderOpponentSeat(roundState, 2, "top", roundState.players[2].money - roundState.penalties[2], roundState.penalties[2])}
        ${renderOpponentSeat(roundState, 1, "left", roundState.players[1].money - roundState.penalties[1], roundState.penalties[1])}

        <section class="center">
          <div class="message">${roundState.message}</div>
          ${roundState.finished ? renderFinishedRoundAction(roundState) : ""}
          <div class="trick">
            ${displayedTrick
              .map(
                (played) => `
                  <div class="played-card ${displayedWinner?.playerId === played.playerId ? "taking" : ""}">
                    <span>${roundState.players[played.playerId].name}</span>
                    ${renderCardFace(played.card)}
                  </div>
                `,
              )
              .join("")}
          </div>
          ${
            displayedWinner && roundState.trick.length > 0
              ? `<div class="taking-label">Aktuálně bere: ${roundState.players[displayedWinner.playerId].name}</div>`
              : displayedWinner
                ? `<div class="taking-label">Poslední štych vzal: ${roundState.players[displayedWinner.playerId].name}</div>`
              : `<div class="taking-label">Čeká se na výnos.</div>`
          }
        </section>

        ${renderOpponentSeat(roundState, 3, "right", roundState.players[3].money - roundState.penalties[3], roundState.penalties[3])}
      </section>

      <section class="bottom-area">
        ${renderHumanStatus(roundState, roundState.players[0].money - roundState.penalties[0], `Platí ${roundState.penalties[0]} Kč`)}
        <div class="hand ${roundState.currentPlayer === 0 ? "active" : ""}">
          ${renderTrickHand(roundState)}
        </div>
      </section>
    </main>
  `;

  app.querySelectorAll<HTMLButtonElement>("[data-card]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.type === "vykladani") {
        return;
      }

      const card = state.hands[0].find((candidate) => cardId(candidate) === button.dataset.card);

      if (!card) {
        return;
      }

      state = playHumanCard(state, card);
      render();
      scheduleBotTurn();
    });
  });

  app.querySelector<HTMLButtonElement>("[data-action='new-game']")?.addEventListener("click", () => {
    clearPendingBotTurn();
    state = createInitialGame();
    render();
  });

  app.querySelector<HTMLButtonElement>("[data-action='next-round']")?.addEventListener("click", () => {
    if (state.type === "vykladani") {
      return;
    }

    const nextRound = createNextTrickRound(state);
    state = nextRound
      ? nextRound
      : createLayingRound({
          players: settleRoundPenalties(state),
          dealer: (state.dealer + 1) % 4,
          bank: state.bank,
        });
    render();
    scheduleAutomatedTurn();
  });

}

function renderFinishedRoundAction(roundState: TrickRoundState): string {
  const nextRound = createNextTrickRound(roundState, () => 0);

  if (!nextRound) {
    return `<button class="secondary" data-action="next-round">Pokračovat na Vykládání</button>`;
  }

  return `<button class="secondary" data-action="next-round">Pokračovat na ${getRoundTitle(nextRound.type)}</button>`;
}

function renderTrickHand(roundState: TrickRoundState): string {
  const legalCards = roundState.currentPlayer === 0 ? getLegalCards(roundState.hands[0], roundState.trick) : [];

  return roundState.hands[0]
    .map((card: Card) => {
      const isPlayable = legalCards.some((legalCard) => cardId(legalCard) === cardId(card));
      return `
        <button
          class="card-button"
          data-card="${cardId(card)}"
          ${!isPlayable || roundState.finished ? "disabled" : ""}
        >
          ${renderCardFace(card)}
        </button>
      `;
    })
    .join("");
}

function renderLayingRound(roundState: LayingRoundState): void {
  app.innerHTML = `
    <main class="table table-laying">
      <header class="topbar">
        <div class="brand">
          <h1>Filky</h1>
          <span>Kolo: Vykládání</span>
        </div>
        <div class="status">
          <strong>Bank: ${roundState.bank} Kč</strong>
          <span>Tvoje peníze: ${roundState.players[0].money} Kč</span>
          <span>Rozdává: ${roundState.players[roundState.dealer].name}</span>
        </div>
        <button class="secondary" data-action="new-game">Nová hra</button>
      </header>

      <section class="tabletop">
        ${renderOpponentSeat(roundState, 2, "top", roundState.players[2].money)}
        ${renderOpponentSeat(roundState, 1, "left", roundState.players[1].money)}

        <section class="center">
          <div class="message">${roundState.message}</div>
          ${roundState.finished ? renderPayoutSummary(roundState) : ""}
          ${roundState.finished ? `<button class="secondary" data-action="continue-game">Další hra</button>` : ""}
          ${renderLayingBoard(roundState)}
          ${renderCompactLayingBoard(roundState)}
          <div class="taking-label">
            Pořadí: ${
              roundState.finishedOrder.length > 0
                ? roundState.finishedOrder.map((playerId) => roundState.players[playerId].name).join(", ")
                : "zatím nikdo"
            }
          </div>
        </section>

        ${renderOpponentSeat(roundState, 3, "right", roundState.players[3].money)}
      </section>

      <section class="bottom-area">
        ${renderHumanStatus(roundState, roundState.players[0].money, `${roundState.hands[0].length} karet`)}
        <div class="hand ${roundState.currentPlayer === 0 ? "active" : ""}">
          ${renderLayingHand(roundState)}
        </div>
      </section>
    </main>
  `;

  app.querySelectorAll<HTMLButtonElement>("[data-card]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.type !== "vykladani") {
        return;
      }

      const card = state.hands[0].find((candidate) => cardId(candidate) === button.dataset.card);

      if (!card) {
        return;
      }

      state = playHumanLayingCard(state, card);
      highlightedPlayerId = 0;
      render();
      scheduleAutomatedTurn();
    });
  });

  app.querySelector<HTMLButtonElement>("[data-action='new-game']")?.addEventListener("click", () => {
    clearPendingBotTurn();
    state = createInitialGame();
    render();
  });

  app.querySelector<HTMLButtonElement>("[data-action='continue-game']")?.addEventListener("click", () => {
    if (state.type !== "vykladani" || !state.finished) {
      return;
    }

    state = createFollowingGame({
      players: state.players,
      previousFirstDealer: state.dealer,
    });
    render();
  });
}

function renderPayoutSummary(roundState: LayingRoundState): string {
  return `
    <div class="payouts">
      ${roundState.players
        .map(
          (player) => `
            <div>
              <span>${player.name}</span>
              <strong>+${roundState.payouts[player.id]} Kč</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderLayingBoard(roundState: LayingRoundState): string {
  return `
    <div class="laying-board full-board">
      ${suits
        .map(
          (suit) => `
            <div class="laying-row">
              <div class="laying-slots">
                ${(["7", "8", "9", "10", "spodek", "svrsek", "kral", "eso"] as const)
                  .map((rank) => renderLayingSlot(roundState, suit, rank))
                  .join("")}
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCompactLayingBoard(roundState: LayingRoundState): string {
  return `
    <div class="laying-board-compact">
      ${suits.map((suit) => renderCompactLayingRow(roundState, suit)).join("")}
    </div>
  `;
}

function renderCompactLayingRow(roundState: LayingRoundState, suit: Suit): string {
  const row = roundState.rows[suit];

  if (!row) {
    return `
      <div class="compact-laying-row">
        <span class="compact-laying-slot empty spodek-slot">Spodek</span>
      </div>
    `;
  }

  const visibleRanks =
    row.low === "spodek" && row.high === "spodek"
      ? (["spodek"] as Rank[])
      : row.low === "spodek"
        ? (["spodek", row.high] as Rank[])
        : row.high === "spodek"
          ? ([row.low, "spodek"] as Rank[])
          : ([row.low, row.high] as Rank[]);

  return `
    <div class="compact-laying-row">
      ${visibleRanks
        .map(
          (rank, index) => `
            ${index > 0 ? `<span class="compact-laying-gap" aria-hidden="true"></span>` : ""}
            <span class="compact-laying-slot ${rank === "spodek" ? "spodek-slot" : ""}">
              ${renderCardFace({ suit, rank })}
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderLayingSlot(roundState: LayingRoundState, suit: Suit, rank: Rank): string {
  const row = roundState.rows[suit];
  const isPlaced =
    !!row && ranks.indexOf(rank) >= ranks.indexOf(row.low) && ranks.indexOf(rank) <= ranks.indexOf(row.high);

  if (!isPlaced) {
    return `<span class="laying-slot empty ${rank === "spodek" ? "spodek-slot" : ""}">${rankLabel(rank)}</span>`;
  }

  return `<span class="laying-slot ${rank === "spodek" ? "spodek-slot" : ""}">${renderCardFace({ suit, rank })}</span>`;
}

function renderLayingHand(roundState: LayingRoundState): string {
  const legalCards = roundState.currentPlayer === 0 ? getLegalLayingCards(roundState, 0) : [];

  return roundState.hands[0]
    .map((card: Card) => {
      const isPlayable = legalCards.some((legalCard) => cardId(legalCard) === cardId(card));
      return `
        <button
          class="card-button"
          data-card="${cardId(card)}"
          ${!isPlayable || roundState.finished ? "disabled" : ""}
        >
          ${renderCardFace(card)}
        </button>
      `;
    })
    .join("");
}

function renderOpponentSeat(
  roundState: GameUiState,
  playerId: number,
  position: "top" | "left" | "right",
  money: number,
  payment?: number,
): string {
  const player = roundState.players[playerId];
  const cardCount = roundState.hands[playerId].length;
  const paymentLabel = payment === undefined ? "" : `<span>Platí ${payment} Kč</span>`;

  return `
    <article class="player seat-${position} ${roundState.currentPlayer === player.id ? "active" : ""} ${highlightedPlayerId === player.id ? "pulse" : ""}">
      <div class="player-meta">
        <strong>${displayPlayerName(player.name)}</strong>
        <span>${money} Kč</span>
        ${paymentLabel}
        <span>${cardCount} karet</span>
      </div>
      ${renderCardBacks(cardCount)}
    </article>
  `;
}

function renderHumanStatus(roundState: GameUiState, money: number, detail: string): string {
  return `
    <section class="human-status ${roundState.currentPlayer === 0 ? "active" : ""} ${highlightedPlayerId === 0 ? "pulse" : ""}">
      <strong>${displayPlayerName(roundState.players[0].name)}</strong>
      <span>${money} Kč</span>
      <span>${detail}</span>
    </section>
  `;
}

function displayPlayerName(name: string): string {
  return name.replace(/^Bot /, "");
}

function renderCardFace(card: Card): string {
  return `
    <span class="card-face suit-${card.suit} rank-${card.rank}" aria-label="${cardLabel(card)}">
      <span class="sr-only">${cardLabel(card)}</span>
    </span>
  `;
}

function renderCardBacks(count: number): string {
  const visibleCount = Math.min(count, 8);

  return `
    <span class="card-backs" aria-label="${count} karet">
      ${Array.from({ length: visibleCount }, (_, index) => `<i style="--offset: ${index}"></i>`).join("")}
    </span>
  `;
}

function rankLabel(rank: Rank): string {
  const labels: Record<Rank, string> = {
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    spodek: "Spodek",
    svrsek: "Svrsek",
    kral: "Král",
    eso: "Eso",
  };

  return labels[rank];
}

function applyCardSpritePositions(): void {
  const root = document.documentElement;

  ranks.forEach((rank, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    root.style.setProperty(`--rank-${rank}-x`, `${column * 33.333333}%`);
    root.style.setProperty(`--rank-${rank}-y`, `${row * 100}%`);
  });
}

function clearPendingBotTurn(): void {
  if (botTurnTimer === undefined) {
    return;
  }

  window.clearTimeout(botTurnTimer);
  botTurnTimer = undefined;
}

function scheduleBotTurn(): void {
  clearPendingBotTurn();

  if (state.type === "vykladani" || state.finished) {
    return;
  }

  if (state.awaitingNextTrick) {
    botTurnTimer = window.setTimeout(() => {
      botTurnTimer = undefined;

      if (state.type === "vykladani" || state.finished || !state.awaitingNextTrick) {
        return;
      }

      state = continueAfterCompletedTrick(state);
      render();
      scheduleBotTurn();
    }, 1700);
    return;
  }

  if (state.currentPlayer === 0) {
    return;
  }

  botTurnTimer = window.setTimeout(() => {
    botTurnTimer = undefined;

    if (state.type === "vykladani" || state.finished || state.awaitingNextTrick || state.currentPlayer === 0) {
      return;
    }

    const playerId = state.currentPlayer;
    state = playCard(state, playerId, chooseBotCard(state, playerId));
    render();
    scheduleBotTurn();
  }, 850);
}

function scheduleLayingTurn(): void {
  clearPendingBotTurn();

  if (state.type !== "vykladani" || state.finished) {
    return;
  }

  const legalCards = getLegalLayingCards(state, state.currentPlayer);

  if (state.currentPlayer === 0 && legalCards.length > 0) {
    return;
  }

  botTurnTimer = window.setTimeout(() => {
    botTurnTimer = undefined;

    if (state.type !== "vykladani" || state.finished) {
      return;
    }

    const playerId = state.currentPlayer;
    const legalCardsForPlayer = getLegalLayingCards(state, playerId);
    highlightedPlayerId = playerId;

    state =
      legalCardsForPlayer.length === 0
        ? passLayingTurn(state, playerId)
        : playLayingCard(state, playerId, chooseLayingBotCard(state, playerId));

    render();
    window.setTimeout(() => {
      if (highlightedPlayerId === playerId) {
        highlightedPlayerId = null;
        render();
      }
    }, 520);
    scheduleLayingTurn();
  }, 900);
}

function scheduleAutomatedTurn(): void {
  if (state.type === "vykladani") {
    scheduleLayingTurn();
    return;
  }

  scheduleBotTurn();
}

applyCardSpritePositions();
render();
scheduleAutomatedTurn();
