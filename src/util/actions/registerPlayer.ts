import { GuildMember, TextChannel, Util } from "discord.js";
import Player from "../../schemas/Player";
import { getDiscord, getGuild } from "../api/hypixel";
import { getProfile, MinecraftProfile } from "../api/mojang";
import { IGuildSettings } from "../../schemas/GuildSettings";
import playerEloChange from "./playerEloChange";
import playerGuildChange from "./playerGuildChange";

const createAndUpdatePlayer = (member: GuildMember, profile: MinecraftProfile, guildId: string | undefined, settings: IGuildSettings, channel: TextChannel) => {
  Player.findOne({ discordId: member.id })
    .then((player) => {
      if (!player) {
        player = new Player({ discordId: member.id });
      }

      player.uuid = profile.uuid;
      player.name = profile.name;
      player.guildId = guildId !== undefined ? guildId : "";
      player.save();

      if (!member.roles.cache.has(settings.registeredRole)) member.roles.add(settings.registeredRole).catch(() => {});
      playerEloChange(member, player, settings.rankRoles);
      playerGuildChange(member, player, settings);

      channel.send(`Registered as ${Util.escapeMarkdown(player.name)} (${player.uuid})`);
    })
    .catch((err) => {
      console.log(err);
      channel.send("Error checking if you've already registered");
    });
};

const registerPlayer = async (member: GuildMember, name: string, force: boolean, settings: IGuildSettings, channel: TextChannel) => {
  getProfile(name)
    .then((profile) => {
      if (!profile) {
        channel.send("Please register as a valid player");
        return;
      }

      const hypixelGuildPromise = getGuild({ player: profile.uuid }, false);
      const hypixelDiscordPromise = getDiscord(profile.uuid);

      Promise.all([hypixelGuildPromise, hypixelDiscordPromise])
        .then(([hypixelGuild, hypixelDiscord]) => {
          if (force) {
            createAndUpdatePlayer(member, profile, hypixelGuild?.guildId, settings, channel);
            return;
          }

          if (!hypixelDiscord) {
            channel.send("Please link your discord tag to your hypixel account");
            return;
          }

          if (hypixelDiscord !== member.user.tag) {
            const cleanedDiscordTag = Util.removeMentions(Util.escapeMarkdown(member.user.tag));
            const cleanedHypixelTag = Util.removeMentions(Util.escapeMarkdown(hypixelDiscord));

            channel.send(`Please update your Discord tag on hypixel to ${cleanedDiscordTag}, your current one is ${cleanedHypixelTag}`);
            return;
          }

          createAndUpdatePlayer(member, profile, hypixelGuild?.guildId, settings, channel);
        })
        .catch((err) => {
          channel.send("Error getting from the hypixel api" + (err ? ` (${err})` : ""));
        });
    })
    .catch((err) => {
      if (err === 400) channel.send("Please put a valid username as the first argument");
      else channel.send("Error getting uuid from mojang api" + (err ? ` (${err})` : ""));
    });
};

export default registerPlayer;
