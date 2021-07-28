import Client from "./Client";
import { Message } from "discord.js";
import { IGuildSettings } from "../schemas/GuildSettings";

export type RunCallback = (client: Client, message: Message, args: string[], settings?: IGuildSettings | null) => void;

export default interface Command {
  name: string;
  run: RunCallback;
  aliases?: string[];
}
