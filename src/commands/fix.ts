import Player from "../schemas/Player";
import Command, { RunCallback } from "../structures/Command";
import playerEloChange from "../util/actions/playerEloChange";
import playerGuildChange from "../util/actions/playerGuildChange";
import removeRoles from "../util/actions/removeRoles";
import { getGuild } from "../util/api/hypixel";
import { getName } from "../util/api/mojang";

const run: RunCallback = async (client, message, args, settings) => {
  if (!settings) return;

  let id = message.mentions.users.first()?.id;
  if (!id) id = message.author.id;

  const playerPromise = Player.findOne({ discordId: id });
  const memberPromise = message.guild?.members.fetch(id);
  const [player, member] = await Promise.all([playerPromise, memberPromise]);

  if (!player && member) {
    member.setNickname(null).catch(() => {});
    removeRoles(member, settings.rankRoles);
    if (member.roles.cache.has(settings.registeredRole)) member.roles.remove(settings.registeredRole).catch(() => {});
  }

  if (member && player) {
    if (!member.roles.cache.has(settings.registeredRole)) {
      member.roles.add(settings.registeredRole).catch((err) => {
        console.log(`Error adding registered role to ${member.user.tag}`, err);
      });
    }

    const name = await getName(player.uuid);
    if (name && player.name !== name) {
      player.name = name;
      player.save().catch((err) => {
        console.log(`Error updating player name ${player.uuid} --> ${name}`, err);
      });
    }

    const hypixelGuild = await getGuild({ player: player.uuid }).catch((err) => {
      console.log("Error getting hypixel guild", err);
    });

    if (hypixelGuild) {
      player.guildId = hypixelGuild.guildId;
      player.save().catch((err) => {
        console.log(`Error saving player's hypixel id`, player.name, hypixelGuild.guildId);
      });
    }

    if (!member.roles.cache.has(settings.registeredRole)) member.roles.add(settings.registeredRole).catch(() => {});
    playerEloChange(member, player, settings.rankRoles);
    playerGuildChange(member, player, settings);

    message.channel.send(`Fixed player ${member.user.tag}`);
  }
};

const FixCommand: Command = {
  name: "fix",
  run,
};

module.exports = FixCommand;
