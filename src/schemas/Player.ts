import { Schema, model, Document } from "mongoose";
import { GuildMember } from "discord.js";

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
  discordId: GuildMember["id"];
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
}

const PlayerSchema = new Schema({
  discordId: { type: String, required: true, index: true, unique: true },
  name: { type: String, requried: true, index: true, unique: true },
  uuid: { type: String, requried: true, unique: true },
  elo: { type: Number },
  eloHigh: { type: Number },
  wins: { type: Number },
  losses: { type: Number },
  mvps: { type: Number },
  winstreak: { type: Number },
  winstreakHigh: { type: Number },
  losestreak: { type: Number },
});

export default model<IPlayer>("Players", PlayerSchema);
