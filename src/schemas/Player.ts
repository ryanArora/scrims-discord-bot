import { Schema, model, Document } from "mongoose";
import { Snowflake } from "discord.js";

export enum Rank {
  STONE,
  COAL,
  IRON,
  GOLD,
  DIAMOND,
  EMERALD,
  SAPPHIRE,
  RUBY,
  TOURMALNE,
  AMETHYST,
  ALEXANDRITE,
  TANZANITE,
  TOPAZ,
}

export interface IPlayer extends Document {
  discordId: Snowflake;
  name: string;
  uuid: string;
  elo: number;
  eloHigh: number;
  wins: number;
  losses: number;
  mvps: number;
  winstreak: number;
  winstreakHigh: number;
  losestreak: number;
  scores?: number;
  games: number[];
}

const PlayerSchema = new Schema({
  discordId: { type: String, required: true, index: true, unique: true },
  name: { type: String, requried: true, index: true, unique: true },
  uuid: { type: String, requried: true, unique: true },
  elo: { type: Number, default: 0, required: true },
  eloHigh: { type: Number, default: 0, required: true },
  wins: { type: Number, default: 0, required: true },
  losses: { type: Number, default: 0, required: true },
  mvps: { type: Number, default: 0, required: true },
  winstreak: { type: Number, default: 0, required: true },
  winstreakHigh: { type: Number, default: 0, required: true },
  losestreak: { type: Number, default: 0, required: true },
  scores: Number,
  games: { type: [Number], default: [], required: true },
});

export default model<IPlayer>("Players", PlayerSchema);
