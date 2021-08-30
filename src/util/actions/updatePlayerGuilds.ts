import { Guild } from "discord.js";
import { IGuildSettings } from "../../schemas/GuildSettings";
import Player from "../../schemas/Player";
import { getGuild, HypixelGuild } from "../api/hypixel";
import playerGuildChange from "./playerGuildChange";

const updatePlayerGuilds = async (guild: Guild, settings: IGuildSettings) => {
  let alliedGuilds = await Promise.all(settings.alliedGuilds.map((a) => getGuild({ id: a.id }, false)));
  const players = await Player.find({});

  if (alliedGuilds.some((g) => g === null)) {
    console.log("a guild was null, aborting updatePlayerGuilds");
    return;
  }

  for (const guild of alliedGuilds as HypixelGuild[]) {
    for (const member of guild.members) {
      const player = players.find((p) => p.uuid === member.uuid);
      if (!player) continue;

      if (player.guildId !== guild.guildId) {
        player.guildId = guild.guildId;
        player.save().catch((err) => {
          console.log(`Error saving player ${player.uuid} (${player.name})`, err);
        });
      }
    }
  }

  for (const player of players) {
    const member = await guild.members.fetch(player.discordId).catch(() => {});
    if (!member) continue;

    console.log("playerguildchange", member.user.tag, player.name, player.uuid);

    playerGuildChange(member, player, settings);
  }
};

export default updatePlayerGuilds;
