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
  games: number[];
}

const PlayerSchema = new Schema({
  discordId: { type: String, required: true, index: true, unique: true },
  name: { type: String, requried: true, index: true, unique: true },
  uuid: { type: String, requried: true, unique: true },
  elo: Number,
  eloHigh: Number,
  wins: Number,
  losses: Number,
  mvps: Number,
  winstreak: Number,
  winstreakHigh: Number,
  losestreak: Number,
  games: [Number],
});

export default model<IPlayer>("Players", PlayerSchema);
