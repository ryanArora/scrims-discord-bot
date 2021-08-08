import Client from "../structures/Client";
import { Message } from "discord.js";
import Event from "../structures/Event";
import { IGuildSettings } from "../schemas/GuildSettings";

const messageCreate = async (client: Client, message: Message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(client.prefix)) return;

  let settings: IGuildSettings | null = null;
  if (message.guild) settings = await client.getGuildSettings(message.guild.id);

  const args: string[] = message.content.slice(client.prefix.length).trim().split(/ +/g);
  const commandName = args.shift()!.toLowerCase();

  const command = client.commands.get(commandName) ?? client.commands.find((cmd) => (cmd.aliases ? cmd.aliases.includes(commandName) : false));
  if (command) {
    command.run(client, message, args, settings);
  }
};

const MessageCreateEvent: Event = {
  name: "messageCreate",
  run: messageCreate,
};

module.exports = MessageCreateEvent;
