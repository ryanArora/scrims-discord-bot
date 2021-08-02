import axios from "axios";

const isInGuild = async (uuid: string, guildId: string) => {
  const res = await axios.get(`https://api.hypixel.net/guild?key=${process.env.HYPIXEL_API_KEY}&id=${guildId}`).catch(() => {});

  const guild = res?.data;
  if (!guild?.members) return false;

  for (const member of guild.members) {
    if (member.uuid === uuid) {
      return true;
    }
  }

  return false;
};

export default isInGuild;
