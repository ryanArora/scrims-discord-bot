import Client from "../strutures/Client";
import { Message } from "discord.js";
import Event from "../strutures/Event";

const ready = async (client: Client, message: Message) => {
  console.log("Bot is ready omg gomgogm");
};

const ReadyEvent: Event = {
  name: "ready",
  run: ready,
};

module.exports = ReadyEvent;
