import { Schema, model, Document } from "mongoose";
import { GuildMember } from "discord.js";

export interface IPlayer extends Document {
  discordId: GuildMember["id"];
  name: string;
  uuid: string;
  elo: number;
  wins: number;
  losses: number;
  wlr: number;
  mvps: number;
  winstreak: number;
  losestreak: number;
}

const PlayerSchema = new Schema({
  discordId: { type: String, required: true, index: true, unique: true },
  name: { type: String, requried: true, index: true, unique: true },
  uuid: { type: String, requried: true, unique: true },
  elo: { type: Number },
  wins: { type: Number },
  losses: { type: Number },
  wlr: { type: Number },
  mvps: { type: Number },
  winstreak: { type: Number },
  losestreak: { type: Number },
});

export default model<IPlayer>("Players", PlayerSchema);
