import { Schema, model, Document } from "mongoose";
import { Snowflake } from "discord.js";

export enum GameState {
  PICKING,
  PLAYING,
  SCORING,
  FINISHED,
}

export interface IGame extends Document {
  gameId: number;
  players: Snowflake[];
  textChannel: Snowflake;
  teamPickingVoiceChannel: Snowflake;
  team1VoiceChannel: Snowflake;
  team2VoiceChannel: Snowflake;
  team1: Snowflake[];
  team2: Snowflake[];
  pickNumber: number;
  state: GameState;
  voided: boolean;
  mvps: Snowflake[];
  winningTeam: number;
}

const GameSchema = new Schema({
  gameId: { type: Number, requried: true, index: true, unique: true },
  players: [String],
  textChannel: { type: String, index: true },
  teamPickingVoiceChannel: String,
  team1VoiceChannel: String,
  team2VoiceChannel: String,
  team1: [String],
  team2: [String],
  pickNumber: Number,
  state: { type: Number, enum: Object.values(GameState) },
  voided: Boolean,
  mvps: [String],
  winningTeam: { type: Number, enum: [1, 2] },
});

export default model<IGame>("Games", GameSchema);
