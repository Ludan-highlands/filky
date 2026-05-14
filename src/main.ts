import "./styles.css";
import { cardId, cardLabel, Card } from "./game/cards";
import {
  continueAfterCompletedTrick,
  createNextTrickRound,
  getRoundTitle,
  playBotsUntilHumanTurn,
  playHumanCard,
  settleRoundPenalties,
  TrickRoundState,
} from "./game/trickRound";
import { createFollowingGame, createInitialGame } from "./game/gameFlow";
import { getCurrentTrickWinner, getLegalCards } from "./game/trick";
import {
  createLayingRound,
  getLegalLayingCards,
  getLayingRowsForDisplay,
  LayingRoundState,
  playHumanLayingCard,
  playLayingBotsUntilHumanTurn,
} from "./game/layingRound";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("App root is missing.");
}

const app = appRoot;
type GameUiState = TrickRoundState | LayingRoundState;

let state: GameUiState = createInitialGame();

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
    <main class="table">
      <header class="topbar">
        <div>
          <h1>Filky</h1>
          <span>Kolo: ${getRoundTitle(roundState.type)}</span>
        </div>
        <div class="status">
          <strong>Bank: ${roundState.bank} Kc</strong>
          <span>Tve penize: ${roundState.players[0].money - roundState.penalties[0]} Kc</span>
          <span>Rozdava: ${roundState.players[roundState.dealer].name}</span>
        </div>
        <button class="secondary" data-action="new-game">Nova hra</button>
      </header>

      <section class="opponents">
        ${roundState.players
          .filter((player) => !player.isHuman)
          .map(
            (player) => `
              <article class="player ${roundState.currentPlayer === player.id ? "active" : ""}">
                <strong>${player.name}</strong>
                <span>${player.money - roundState.penalties[player.id]} Kc</span>
                <span>${roundState.hands[player.id].length} karet</span>
                ${renderCardDots(roundState.hands[player.id].length)}
              </article>
            `,
          )
          .join("")}
      </section>

      <section class="center">
        <div class="message">${roundState.message}</div>
        ${roundState.finished ? renderFinishedRoundAction(roundState) : ""}
        <div class="trick">
          ${displayedTrick
            .map(
              (played) => `
                <div class="played-card ${played.card.suit} ${displayedWinner?.playerId === played.playerId ? "taking" : ""}">
                  <span>${roundState.players[played.playerId].name}</span>
                  <strong>${cardLabel(played.card)}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
        ${
          displayedWinner && roundState.trick.length > 0
            ? `<div class="taking-label">Aktualne bere: ${roundState.players[displayedWinner.playerId].name}</div>`
            : displayedWinner
              ? `<div class="taking-label">Posledni stych vzal: ${roundState.players[displayedWinner.playerId].name}</div>`
            : `<div class="taking-label">Ceka se na vynos.</div>`
        }
      </section>

      <section class="scoreboard">
        ${roundState.players
          .map(
            (player) => `
              <div class="${roundState.currentPlayer === player.id ? "active" : ""}">
                <span>${player.name}</span>
                <strong>${roundState.penalties[player.id]} Kc pokuta</strong>
              </div>
            `,
          )
          .join("")}
      </section>

      ${roundState.awaitingNextTrick ? `<section class="table-action"><button class="secondary" data-action="next-trick">Dalsi stych</button></section>` : ""}

      <section class="hand ${roundState.currentPlayer === 0 ? "active" : ""}">
        ${renderTrickHand(roundState)}
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

      state = playBotsUntilHumanTurn(playHumanCard(state, card));
      render();
    });
  });

  app.querySelector<HTMLButtonElement>("[data-action='new-game']")?.addEventListener("click", () => {
    state = createInitialGame();
    render();
  });

  app.querySelector<HTMLButtonElement>("[data-action='next-round']")?.addEventListener("click", () => {
    if (state.type === "vykladani") {
      return;
    }

    const nextRound = createNextTrickRound(state);
    state = nextRound
      ? playBotsUntilHumanTurn(nextRound)
      : playLayingBotsUntilHumanTurn(
          createLayingRound({
            players: settleRoundPenalties(state),
            dealer: (state.dealer + 1) % 4,
            bank: state.bank,
          }),
        );
    render();
  });

  app.querySelector<HTMLButtonElement>("[data-action='next-trick']")?.addEventListener("click", () => {
    if (state.type === "vykladani") {
      return;
    }

    state = playBotsUntilHumanTurn(continueAfterCompletedTrick(state));
    render();
  });
}

function renderFinishedRoundAction(roundState: TrickRoundState): string {
  const nextRound = createNextTrickRound(roundState, () => 0);

  if (!nextRound) {
    return `<button class="secondary" data-action="next-round">Pokracovat na Vykladani</button>`;
  }

  return `<button class="secondary" data-action="next-round">Pokracovat na ${getRoundTitle(nextRound.type)}</button>`;
}

function renderTrickHand(roundState: TrickRoundState): string {
  const legalCards = roundState.currentPlayer === 0 ? getLegalCards(roundState.hands[0], roundState.trick) : [];

  return roundState.hands[0]
    .map((card: Card) => {
      const isPlayable = legalCards.some((legalCard) => cardId(legalCard) === cardId(card));
      return `
        <button
          class="card ${card.suit}"
          data-card="${cardId(card)}"
          ${!isPlayable || roundState.finished ? "disabled" : ""}
        >
          <strong>${card.rank}</strong>
          <span>${card.suit}</span>
        </button>
      `;
    })
    .join("");
}

function renderLayingRound(roundState: LayingRoundState): void {
  app.innerHTML = `
    <main class="table">
      <header class="topbar">
        <div>
          <h1>Filky</h1>
          <span>Kolo: Vykladani</span>
        </div>
        <div class="status">
          <strong>Bank: ${roundState.bank} Kc</strong>
          <span>Tve penize: ${roundState.players[0].money} Kc</span>
          <span>Rozdava: ${roundState.players[roundState.dealer].name}</span>
        </div>
        <button class="secondary" data-action="new-game">Nova hra</button>
      </header>

      <section class="opponents">
        ${roundState.players
          .filter((player) => !player.isHuman)
          .map(
            (player) => `
              <article class="player ${roundState.currentPlayer === player.id ? "active" : ""}">
                <strong>${player.name}</strong>
                <span>${player.money} Kc</span>
                <span>${roundState.hands[player.id].length} karet</span>
                ${renderCardDots(roundState.hands[player.id].length)}
              </article>
            `,
          )
          .join("")}
      </section>

      <section class="center">
        <div class="message">${roundState.message}</div>
        ${roundState.finished ? renderPayoutSummary(roundState) : ""}
        ${roundState.finished ? `<button class="secondary" data-action="continue-game">Dalsi hra</button>` : ""}
        <div class="laying-rows">
          ${getLayingRowsForDisplay(roundState.rows)
            .map(
              (row) => `
                <div class="laying-row ${row.suit}">
                  <strong>${row.suit}</strong>
                  <span>${row.low} - ${row.high}</span>
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="taking-label">
          Poradi: ${
            roundState.finishedOrder.length > 0
              ? roundState.finishedOrder.map((playerId) => roundState.players[playerId].name).join(", ")
              : "zatim nikdo"
          }
        </div>
      </section>

      <section class="scoreboard">
        ${roundState.players
          .map(
            (player) => `
              <div class="${roundState.currentPlayer === player.id ? "active" : ""}">
                <span>${player.name}</span>
                <strong>${roundState.hands[player.id].length} karet</strong>
              </div>
            `,
          )
          .join("")}
      </section>

      <section class="hand ${roundState.currentPlayer === 0 ? "active" : ""}">
        ${renderLayingHand(roundState)}
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

      state = playLayingBotsUntilHumanTurn(playHumanLayingCard(state, card));
      render();
    });
  });

  app.querySelector<HTMLButtonElement>("[data-action='new-game']")?.addEventListener("click", () => {
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
              <strong>+${roundState.payouts[player.id]} Kc</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderLayingHand(roundState: LayingRoundState): string {
  const legalCards = roundState.currentPlayer === 0 ? getLegalLayingCards(roundState, 0) : [];

  return roundState.hands[0]
    .map((card: Card) => {
      const isPlayable = legalCards.some((legalCard) => cardId(legalCard) === cardId(card));
      return `
        <button
          class="card ${card.suit}"
          data-card="${cardId(card)}"
          ${!isPlayable || roundState.finished ? "disabled" : ""}
        >
          <strong>${card.rank}</strong>
          <span>${card.suit}</span>
        </button>
      `;
    })
    .join("");
}

function renderCardDots(count: number): string {
  return `
    <span class="card-dots" aria-label="${count} karet">
      ${Array.from({ length: count }, () => `<i></i>`).join("")}
    </span>
  `;
}

render();
