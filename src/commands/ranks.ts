import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed } from "discord.js";
import { Rank } from "../schemas/Player";

const run: RunCallback = async (client, message, args, settings) => {
  if (!settings) return;
  const ranks = settings.rankRoles;

  let msg = "";
  msg += `<@&${ranks[Rank.TOPAZ]}> - (2500) W: (+10) L: (-55)\n`;
  msg += `<@&${ranks[Rank.TANZANITE]}> - (2200) W: (+15) L: (-50)\n`;
  msg += `<@&${ranks[Rank.ALEXANDRITE]}> - (2000) W: (+20) L: (-45)\n`;
  msg += `<@&${ranks[Rank.AMETHYST]}> - (1800) W: (+25) L: (-40)\n`;
  msg += `<@&${ranks[Rank.TOURMALNE]}> - (1600) W: (+30) L: (-35)\n`;
  msg += `<@&${ranks[Rank.RUBY]}> - (1400) W: (+33) L: (-30)\n`;
  msg += `<@&${ranks[Rank.SAPPHIRE]}> - (1200) W: (+35) L: (-25)\n`;
  msg += `<@&${ranks[Rank.EMERALD]}> - (1000) W: (+38) L: (-25)\n`;
  msg += `<@&${ranks[Rank.DIAMOND]}> - (800) W: (+40) L: (-20)\n`;
  msg += `<@&${ranks[Rank.GOLD]}> - (600) W: (+43) L: (-20)\n`;
  msg += `<@&${ranks[Rank.IRON]}> - (400) W: (+45) L: (-15)\n`;
  msg += `<@&${ranks[Rank.COAL]}> - (200) W: (+48) L: (-15)\n`;
  msg += `<@&${ranks[Rank.STONE]}> - (0) W: (+50) L: (-10)\n\n`;

  msg += `<@&${ranks[Rank.DIAMOND]}> and below (MVP +10)\n`;
  msg += `<@&${ranks[Rank.EMERALD]}> and above (MVP +5)`;

  const embed = new MessageEmbed();
  embed.setTitle("ELO Ranks");
  embed.setDescription(msg);

  message.channel.send({ embeds: [embed] });
};

const RanksCommand: Command = {
  name: "ranks",
  run,
};

module.exports = RanksCommand;
