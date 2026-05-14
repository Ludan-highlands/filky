export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  money: number;
}

export function createPlayers(): Player[] {
  return [
    { id: 0, name: "Ty", isHuman: true, money: 50 },
    { id: 1, name: "Bot Pepa", isHuman: false, money: 50 },
    { id: 2, name: "Bot Franta", isHuman: false, money: 50 },
    { id: 3, name: "Bot Karel", isHuman: false, money: 50 },
  ];
}

export function nextPlayer(playerId: number): number {
  return (playerId + 1) % 4;
}

export function advancePlayer(playerId: number, steps: number): number {
  return (playerId + steps) % 4;
}
