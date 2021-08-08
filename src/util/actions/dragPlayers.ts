import { TextBasedChannels, VoiceChannel } from "discord.js";

const dragPlayers = (voice: VoiceChannel, players: string[], channel?: TextBasedChannels) => {
  return new Promise<string[]>(async (resolve, reject) => {
    const notMoved: string[] = [];

    for (const playerId of players) {
      const member = voice.guild.members.cache.get(playerId);
      if (!member) {
        if (channel) channel.send(`Could not drag <@${playerId}> to their voice channel!`).catch(() => {});
        continue;
      }

      await member.voice.setChannel(voice).catch(() => {
        if (channel) channel.send(`Could not drag <@${playerId}> to their voice channel!`).catch(() => {});
        notMoved.push(playerId);
      });
    }

    resolve(notMoved);
  });
};

export default dragPlayers;
