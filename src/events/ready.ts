import Client from "../structures/Client";
import { Message } from "discord.js";
import Event from "../structures/Event";

const ready = async (client: Client, message: Message) => {
  console.log("Bot is ready omg gomgogm");
};

const ReadyEvent: Event = {
  name: "ready",
  run: ready,
};

module.exports = ReadyEvent;
