import { GuildMember } from "discord.js";
import GuildSettings, { IGuildSettings } from "../../schemas/GuildSettings";
import { IPlayer } from "../../schemas/Player";
import removeRoles from "./removeRoles";

const playerGuildChange = async (member: GuildMember, player: IPlayer, settings: IGuildSettings) => {
  const alliedPlayer = settings.alliedPlayers.includes(player.uuid);
  const hasAllyRole = member.roles.cache.has(settings.alliedRole);

  if (alliedPlayer && !hasAllyRole) {
    member.roles.add(settings.alliedRole).catch((err) => {
      console.log(`error adding ally role to ${member.user.tag}`, err);
    });
  } else if (!alliedPlayer && hasAllyRole) {
    member.roles.remove(settings.alliedRole).catch((err) => {
      console.log(`error removing ally role from ${member.user.tag}`, err);
    });
  }

  const alliedGuild = settings.alliedGuilds.find((g) => g.id === player.guildId);
  const alliedGuildRoles = settings.alliedGuilds.map((a) => a.role);

  if (alliedGuild && !member.roles.cache.has(alliedGuild.role)) {
    member.roles.add(alliedGuild.role).catch((err) => {
      console.log(`error adding guild role ${alliedGuild.role} to ${member.user.tag}`, err);
    });
  }

  const toRemove = alliedGuildRoles.filter((id) => id !== alliedGuild?.role);
  removeRoles(member, toRemove);

  if (!alliedPlayer && !alliedGuild && !member.roles.cache.has(settings.bannedRole)) {
    member.roles.add(settings.bannedRole).catch((err) => {
      console.log(`error adding banned role ${settings.bannedRole}`, err);
    });
  } else if (!settings.bannedPlayers.includes(player.uuid) && member.roles.cache.has(settings.bannedRole)) {
    member.roles.remove(settings.bannedRole).catch((err) => {
      console.log(`error removing banned role ${settings.bannedRole}`, err);
    });
  } else {
    GuildSettings.updateOne({ _id: settings._id }, { $pullAll: { bannedPlayers: [player.uuid] } }).catch((err) => {
      console.log("error pulling uuid from banned players array", err);
    });
  }
};

export default playerGuildChange;
