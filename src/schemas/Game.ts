import { Schema, model, Document } from "mongoose";
import { GuildMember, TextChannel, VoiceChannel } from "discord.js";

export interface IGame extends Document {
  gameId: number;
  players: GuildMember["id"][];
  textChanel: TextChannel["id"];
  voiceChannel: VoiceChannel["id"];
  team1: GuildMember["id"][];
  team2: GuildMember["id"][];
}

const GameSchema = new Schema({
  gameId: { type: Number, requried: true, index: true, unique: true },
  players: { type: [String] },
  textChannel: { type: String, index: true },
  voiceChannel: { type: String },
  team1: { type: [String] },
  team2: { type: [String] },
});

export default model<IGame>("Games", GameSchema);
