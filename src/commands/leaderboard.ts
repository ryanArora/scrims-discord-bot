import Command, { RunCallback } from "../structures/Command";
import Player from "../schemas/Player";
import { MessageEmbed } from "discord.js";
import ratioStr from "../util/str/ratioStr";
import percentageStr from "../util/str/percentageStr";

const getRatio = (num: number, den: number) => {
  if (num === 0 && den === 0) return 0;
  else return num / den;
};

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  let stat = args[0]?.toLowerCase();
  if (!stat) stat = "elo";

  let players = await Player.find({});
  if (!players) {
    message.channel.send("There aren't any registered players yet!");
    return;
  }

  let cute = "";
  let pageArgumentIndex = 1;

  if (stat === "elo") {
    players.sort((a, b) => b.elo - a.elo);
    cute = "ELO";
  } else if (stat === "wins") {
    players.sort((a, b) => b.wins - a.wins);
    cute = "Wins";
  } else if (stat === "losses") {
    players.sort((a, b) => b.losses - a.losses);
    cute = "Losses";
  } else if (stat === "games") {
    players.sort((a, b) => b.wins + b.losses - (a.wins + a.losses));
    cute = "Games";
  } else if (stat === "mvps" || stat === "mvp") {
    players.sort((a, b) => b.mvps - a.mvps);
    cute = "MVPs";
  } else if (stat === "winloss" || stat === "wlr" || stat === "wl") {
    players.sort((a, b) => getRatio(b.wins, b.losses) - getRatio(a.wins, a.losses));
    cute = "Win/Loss Rate";
  } else if (stat === "mvpr" || stat === "mvprate" || stat === "mvpgames") {
    players.sort((a, b) => getRatio(b.mvps, b.wins + b.losses) - getRatio(a.mvps, a.wins + a.losses));
    cute = "MVP Rate";
  } else if (stat === "winstreak" || stat === "ws") {
    players.sort((a, b) => b.winstreak - a.winstreak);
    cute = "Winstreak";
  } else if (stat === "losestreak" || stat === "ls") {
    players.sort((a, b) => b.losestreak - a.losestreak);
    cute = "Losestreak";
  } else if (stat === "highestelo" || stat === "peakelo" || stat === "elopeak" || stat === "elohigh") {
    players.sort((a, b) => b.eloHigh - a.eloHigh);
    cute = "Highest ELO";
  } else if (stat === "highestwinstreak" || stat === "highestws" || stat === "wshigh" || stat === "winstreakhigh") {
    players.sort((a, b) => b.winstreakHigh - a.winstreakHigh);
    cute = "Highest Winstreak";
  } else {
    players.sort((a, b) => b.elo - a.elo);
    cute = "ELO";
    pageArgumentIndex = 0;
  }

  let page = 1;
  try {
    const num = parseInt(args[pageArgumentIndex] as string, 10);
    if (num) page = Math.floor(num);
  } catch (e) {}

  if (page < 1) page = 1;
  else if ((page - 1) * 20 > players.length) page = Math.ceil(players.length / 20);

  players = players.slice((page - 1) * 20, page * 20);

  let msg = "";

  for (const [i, player] of players.entries()) {
    msg += `${(page - 1) * 20 + i + 1}: ${player.name} - \``;

    if (cute === "Wins") {
      msg += player.wins;
    } else if (cute === "Losses") {
      msg += player.losses;
    } else if (cute === "Games") {
      msg += player.wins + player.losses;
    } else if (cute === "MVPs") {
      msg += player.mvps;
    } else if (cute === "Win/Loss Rate") {
      msg += ratioStr(player.wins, player.losses, 2);
    } else if (cute === "MVP Rate") {
      msg += percentageStr(player.mvps, player.wins + player.losses, 0);
    } else if (cute === "Winstreak") {
      msg += player.winstreak;
    } else if (cute === "Losestreak") {
      msg += player.losestreak;
    } else if (cute === "Highest ELO") {
      msg += player.eloHigh;
    } else if (cute === "Highest Winstreak") {
      msg += player.winstreakHigh;
    } else {
      msg += player.elo;
    }

    msg += "`\n";
  }

  msg = msg.slice(0, -1);

  const embed = new MessageEmbed();
  embed.setTitle(`Leaderboard - ${cute}`);
  embed.setDescription(msg);
  embed.setFooter(`Page ${page}`);
  embed.setTimestamp();

  message.channel.send({ embeds: [embed] });
};

const LeaderboardCommand: Command = {
  name: "leaderboard",
  aliases: ["lb"],
  run,
};

module.exports = LeaderboardCommand;
