import { Schema, model, Document } from "mongoose";
import { GuildMember, TextChannel, VoiceChannel } from "discord.js";

export enum EGameState {
  PICKING,
  PLAYING,
  SCORING,
  FINISHED,
}

export interface IGame extends Document {
  gameId: number;
  players: GuildMember["id"][];
  textChannel: TextChannel["id"];
  teamPickingVoiceChannel: VoiceChannel["id"];
  team1VoiceChannel: VoiceChannel["id"];
  team2VoiceChannel: VoiceChannel["id"];
  team1: GuildMember["id"][];
  team2: GuildMember["id"][];
  pickNumber: number;
  state: EGameState;
  voided: boolean;
  mvps: string[];
  winningTeam: number;
}

const GameSchema = new Schema({
  gameId: { type: Number, requried: true, index: true, unique: true },
  players: { type: [String] },
  textChannel: { type: String, index: true },
  teamPickingVoiceChannel: { type: String },
  team1VoiceChannel: { type: String },
  team2VoiceChannel: { type: String },
  team1: { type: [String] },
  team2: { type: [String] },
  pickNumber: { type: Number },
  state: { type: Number, enum: Object.values(EGameState) },
  voided: { type: Boolean },
  mvps: { type: [String] },
  winningTeam: { type: Number, enum: [1, 2] },
});

export default model<IGame>("Games", GameSchema);
