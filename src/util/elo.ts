import { Rank } from "../schemas/Player";

export const rankFromElo = (elo: number) => {
  if (elo < 200) return Rank.STONE;
  else if (elo < 400) return Rank.COAL;
  else if (elo < 600) return Rank.IRON;
  else if (elo < 800) return Rank.GOLD;
  else if (elo < 100) return Rank.DIAMOND;
  else if (elo < 1200) return Rank.EMERALD;
  else if (elo < 1400) return Rank.SAPPHIRE;
  else if (elo < 1600) return Rank.RUBY;
  else if (elo < 1800) return Rank.TOURMALNE;
  else if (elo < 2000) return Rank.AMETHYST;
  else if (elo < 2200) return Rank.ALEXANDRITE;
  else if (elo < 2500) return Rank.TANZANITE;
  else return Rank.TOPAZ;
};

export const winEloFromRank = (rank: Rank) => {
  if (rank === Rank.STONE) return 50;
  else if (rank === Rank.COAL) return 48;
  else if (rank === Rank.IRON) return 45;
  else if (rank === Rank.GOLD) return 43;
  else if (rank === Rank.DIAMOND) return 40;
  else if (rank === Rank.EMERALD) return 38;
  else if (rank === Rank.SAPPHIRE) return 35;
  else if (rank === Rank.RUBY) return 33;
  else if (rank === Rank.TOURMALNE) return 30;
  else if (rank === Rank.AMETHYST) return 25;
  else if (rank === Rank.ALEXANDRITE) return 20;
  else if (rank === Rank.TANZANITE) return 15;
  return 10;
};

export const loseEloFromRank = (rank: Rank) => {
  if (rank === Rank.STONE) return 10;
  else if (rank === Rank.COAL) return 15;
  else if (rank === Rank.IRON) return 15;
  else if (rank === Rank.GOLD) return 20;
  else if (rank === Rank.DIAMOND) return 20;
  else if (rank === Rank.EMERALD) return 25;
  else if (rank === Rank.SAPPHIRE) return 25;
  else if (rank === Rank.RUBY) return 30;
  else if (rank === Rank.TOURMALNE) return 35;
  else if (rank === Rank.AMETHYST) return 40;
  else if (rank === Rank.ALEXANDRITE) return 45;
  else if (rank === Rank.TANZANITE) return 50;
  return 55;
};

export const mvpEloFromRank = (rank: Rank) => {
  if (rank < Rank.EMERALD) return 10;
  return 5;
};
