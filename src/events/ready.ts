import Client from "../structures/Client";
import Event from "../structures/Event";

const ready = async (client: Client) => {
  console.log("Bot is ready");
};

const ReadyEvent: Event = {
  name: "ready",
  run: ready,
};

module.exports = ReadyEvent;
