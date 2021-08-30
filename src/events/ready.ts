import GuildSettings from "../schemas/GuildSettings";
import Client from "../structures/Client";
import Event from "../structures/Event";
import updatePlayerGuilds from "../util/actions/updatePlayerGuilds";

const ready = async (client: Client) => {
  console.log("Bot is ready!");

  const settingsList = await GuildSettings.find({});
  for (const settings of settingsList) {
    const guild = await client.guilds.fetch(settings.guildId);
    if (!guild) continue;

    updatePlayerGuilds(guild, settings);
  }

  let i = 0;
  setInterval(async () => {
    const settings = settingsList[i];
    if (i >= settingsList.length) i = 0;
    else ++i;
    if (!settings) return;

    const guild = client.guilds.cache.get(settings.guildId);
    if (guild) {
      updatePlayerGuilds(guild, settings);
    } else {
      console.log("Discord guild not found while updating player guilds", settings.guildId);
    }
  }, 1000 * 60 * 5);
};

const ReadyEvent: Event = {
  name: "ready",
  run: ready,
};

module.exports = ReadyEvent;
