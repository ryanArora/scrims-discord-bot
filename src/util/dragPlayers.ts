import { DMChannel, NewsChannel, TextChannel, VoiceChannel } from "discord.js";

const dragPlayers = (voice: VoiceChannel, players: string[], channel?: TextChannel | DMChannel | NewsChannel) => {
  for (const playerId of players) {
    const member = voice.guild.members.cache.get(playerId);
    if (!member) {
      if (channel) channel.send(`Could not drag <@${playerId}> to their voice channel!`).catch(() => {});
      continue;
    }

    member.voice.setChannel(voice).catch(() => {
      if (channel) channel.send(`Could not drag <@${playerId}> to their voice channel!`).catch(() => {});
    });
  }
};

export default dragPlayers;
