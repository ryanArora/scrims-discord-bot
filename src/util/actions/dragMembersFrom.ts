import { VoiceChannel } from "discord.js";

const dragMembersFrom = (from: VoiceChannel, to: VoiceChannel) => {
  from.members.forEach((member) => {
    member.voice.setChannel(to).catch(() => {});
  });
};

export default dragMembersFrom;
