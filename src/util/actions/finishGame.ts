import { IGame } from "../../schemas/Game";
import { IGuildSettings } from "../../schemas/GuildSettings";
import { OverwriteResolvable, Guild, GuildChannel, VoiceChannel, MessageEmbed } from "discord.js";

const getBaseChannelOverwrites = (defaultRole: Guild["id"], scorerRole: IGuildSettings["scorerRole"]) => {
  const overwrites: OverwriteResolvable[] = [
    {
      id: defaultRole,
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: scorerRole,
      allow: ["VIEW_CHANNEL"],
    },
  ];

  return overwrites;
};

// const dragPlayersTo = (playerIds: GuildMember["id"][], to: VoiceChannel) => {
//   for (const id of playerIds) {
//     const member = to.guild.members.cache.get(id);
//     if (!member) continue;

//     member.voice.setChannel(to).catch(() => {});
//   }
// };

const dragPlayersFrom = (from: VoiceChannel, to: VoiceChannel) => {
  from.members.forEach((member) => {
    member.voice.setChannel(to).catch(() => {});
  });
};

const deleteChannelLater = (channel: GuildChannel, ms: number) => {
  setTimeout(() => {
    channel.delete().catch(() => {});
  }, ms);
};

const finishGame = (game: IGame, guild: Guild, settings: IGuildSettings) => {
  const textChannel = guild.channels.cache.get(game.textChannel);
  if (textChannel && textChannel.isText()) {
    const perms = getBaseChannelOverwrites(guild.id, settings.scorerRole);

    for (const id of game.players) {
      perms.push({
        id,
        deny: ["SEND_MESSAGES"],
        allow: ["VIEW_CHANNEL"],
      });
    }

    textChannel.overwritePermissions(perms).catch(() => {});

    const embed = new MessageEmbed();
    embed.setTitle(`Game #${game.gameId} - Game Ended`);

    let msg = "";
    msg += `<#${settings.queueWaiting}>\n`;
    msg += `<#${settings.queue2}>\n`;
    msg += `<#${settings.queue3}>\n`;
    msg += `<#${settings.queue4}>`;

    embed.setDescription(msg);

    textChannel.send({ embed });
  }

  setTimeout(() => {
    if (textChannel) {
      const perms = getBaseChannelOverwrites(guild.id, settings.scorerRole);
      textChannel.overwritePermissions(perms).catch(() => {});

      if (game.voided) {
        textChannel.delete().catch(() => {});
      }
    }

    const waitingRoom = guild.channels.cache.get(settings.queueWaiting);
    const team1Voice = guild.channels.cache.get(game.team1VoiceChannel);
    const team2Voice = guild.channels.cache.get(game.team2VoiceChannel);
    const teamPickingVoiceChannel = guild.channels.cache.get(game.teamPickingVoiceChannel);

    if (!waitingRoom || waitingRoom.type !== "voice") return;

    if (team1Voice && team1Voice.type === "voice") {
      dragPlayersFrom(team1Voice as VoiceChannel, waitingRoom as VoiceChannel);
      deleteChannelLater(team1Voice, 2000);
    }

    if (team2Voice && team2Voice.type === "voice") {
      dragPlayersFrom(team2Voice as VoiceChannel, waitingRoom as VoiceChannel);
      deleteChannelLater(team2Voice, 2000);
    }

    if (teamPickingVoiceChannel && teamPickingVoiceChannel.type === "voice") {
      dragPlayersFrom(teamPickingVoiceChannel as VoiceChannel, waitingRoom as VoiceChannel);
      deleteChannelLater(teamPickingVoiceChannel, 2000);
    }
  }, 10000);
};

export default finishGame;
