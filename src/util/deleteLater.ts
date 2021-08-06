import { GuildChannel, Message } from "discord.js";

const deleteLater = (elem: GuildChannel | Message, ms: number) => {
  setTimeout(() => {
    elem.delete().catch(() => {});
  }, ms);
};

export default deleteLater;
