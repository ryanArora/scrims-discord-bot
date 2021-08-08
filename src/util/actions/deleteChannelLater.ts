import { GuildChannel } from "discord.js";

const deleteChannelLater = (channel: GuildChannel, ms: number) => {
  setTimeout(() => {
    channel.delete().catch(() => {});
  }, ms);
};

export default deleteChannelLater;
