import { Schema, model, Document } from "mongoose";
import { GuildMember, TextChannel, VoiceChannel } from "discord.js";

export interface IGame extends Document {
  gameId: number;
  players: GuildMember["id"][];
  textChanel: TextChannel["id"];
  voiceChannel: VoiceChannel["id"];
}

const GameSchema = new Schema({
  gameId: { type: Number, requried: true, index: true, unique: true },
  players: { type: [String] },
  textChannel: { type: String },
  voiceChannel: { type: String },
});

export default model<IGame>("Games", GameSchema);
