import { IGame } from "../../schemas/Game";
import { IGuildSettings } from "../../schemas/GuildSettings";
import { Guild, VoiceChannel, MessageEmbed, TextChannel } from "discord.js";
import deleteChannelLater from "./deleteChannelLater";
import dragMembersFrom from "./dragMembersFrom";
import getBaseChannelOverwrites from "../getBaseChannelOverwrites";

const finishGame = (game: IGame, guild: Guild, settings: IGuildSettings) => {
  const textChannel = guild.channels.cache.get(game.textChannel);
  if (textChannel instanceof TextChannel) {
    const perms = getBaseChannelOverwrites(guild.id, settings.scorerRole);

    for (const id of game.players) {
      perms.push({
        id,
        deny: ["SEND_MESSAGES"],
        allow: ["VIEW_CHANNEL"],
      });
    }

    textChannel.permissionOverwrites.set(perms).catch(() => {});

    const embed = new MessageEmbed();
    embed.setTitle(`Game #${game.gameId} - Game Ended`);

    let msg = "";
    msg += `<#${settings.queueWaiting}>\n`;
    msg += `<#${settings.queue2}>\n`;
    msg += `<#${settings.queue3}>\n`;
    msg += `<#${settings.queue4}>`;

    embed.setDescription(msg);

    textChannel.send({ embeds: [embed] });
  }

  setTimeout(() => {
    if (textChannel instanceof TextChannel) {
      const perms = getBaseChannelOverwrites(guild.id, settings.scorerRole);
      textChannel.permissionOverwrites.set(perms).catch(() => {});

      if (game.voided) {
        textChannel.delete().catch(() => {});
      }
    }

    const waitingRoom = guild.channels.cache.get(settings.queueWaiting);
    const team1Voice = guild.channels.cache.get(game.team1VoiceChannel);
    const team2Voice = guild.channels.cache.get(game.team2VoiceChannel);
    const teamPickingVoiceChannel = guild.channels.cache.get(game.teamPickingVoiceChannel);

    if (!waitingRoom || waitingRoom.type !== "GUILD_VOICE") return;

    if (team1Voice && team1Voice.type === "GUILD_VOICE") {
      dragMembersFrom(team1Voice as VoiceChannel, waitingRoom as VoiceChannel);
      deleteChannelLater(team1Voice, 2000);
    }

    if (team2Voice && team2Voice.type === "GUILD_VOICE") {
      dragMembersFrom(team2Voice as VoiceChannel, waitingRoom as VoiceChannel);
      deleteChannelLater(team2Voice, 2000);
    }

    if (teamPickingVoiceChannel && teamPickingVoiceChannel.type === "GUILD_VOICE") {
      dragMembersFrom(teamPickingVoiceChannel as VoiceChannel, waitingRoom as VoiceChannel);
      deleteChannelLater(teamPickingVoiceChannel, 2000);
    }
  }, 10000);
};

export default finishGame;
