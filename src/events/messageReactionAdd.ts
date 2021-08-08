import Client from "../structures/Client";
import { MessageReaction, User } from "discord.js";
import Event from "../structures/Event";
import Game, { GameState } from "../schemas/Game";
import finishGame from "../util/actions/finishGame";
import GuildSettings from "../schemas/GuildSettings";

const messageReactionAdd = async (client: Client, reaction: MessageReaction, user: User) => {
  if (!reaction.me || !reaction.count || !reaction.message.guild) return;
  if (user?.bot) return;

  const game = await Game.findOne({ textChannel: reaction.message.channel.id });
  if (!game || game.state === GameState.FINISHED || !game.players.includes(user.id)) return;

  const embed = reaction.message.embeds[0];
  if (!embed?.description) return;
  const desc = embed.description;
  const i = desc.indexOf("/");
  if (i === -1) return;

  const votes = reaction.count - 1;
  const limit = game.players.length / 2 + 1;

  if (votes !== limit) {
    const descArr = [...desc];
    descArr[i - 1] = votes.toString();

    embed.setDescription(descArr.join(""));
    reaction.message.edit({ embeds: [embed] }).catch((err) => {
      console.log(err);
    });

    return;
  }

  game.state = GameState.FINISHED;
  game.voided = true;

  game
    .save()
    .then(async () => {
      embed.setDescription("The game has been voided!");
      reaction.message.edit({ embeds: [embed] });

      if (!reaction.message.guild) return;
      const settings = await GuildSettings.findOne({ guildId: reaction.message.guild.id });

      if (!settings) {
        reaction.message.channel.send("Error getting guild settings!").catch(() => {});
        return;
      }

      finishGame(game, reaction.message.guild, settings);
    })
    .catch((err) => {
      if (!reaction.message.guild) return;
      const channel = reaction.message.guild.channels.cache.get(game.textChannel);
      if (channel && channel.isText()) {
        channel.send("Error voiding game!").catch(() => {});
        console.log(err);
      }
    });
};

const MessageReactionAddEvent: Event = {
  name: "messageReactionAdd",
  run: messageReactionAdd,
};

module.exports = MessageReactionAddEvent;
