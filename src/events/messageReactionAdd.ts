import Client from "../structures/Client";
import { MessageReaction, User } from "discord.js";
import Event from "../structures/Event";
import Game, { EGameState } from "../schemas/Game";

const messageReactionAdd = async (client: Client, reaction: MessageReaction, user: User) => {
  if (reaction.me) return;
  if (!reaction.count) return;
  if (client.user?.id && !reaction.users.cache.has(client.user.id)) return;

  const embed = reaction.message.embeds[0];
  if (!embed?.description) return;
  let desc = embed.description;

  const i = desc.indexOf("/");
  if (i === -1) return;

  const votes = reaction.count - 1;
  const game = await Game.findOne({ textChannel: reaction.message.channel.id });
  if (!game) return;
  if (game.state === EGameState.FINISHED) return;

  const limit = game.players.length / 2 + 1;

  if (votes === limit) {
    if (!game) return;

    game.state = EGameState.FINISHED;
    game.voided = true;
    game
      .save()
      .then(() => {
        embed.setDescription("The game has been voided!");
        reaction.message.edit({ embed }).catch(() => {});
      })
      .catch(console.log);
  } else {
    // convert to array to manipulate string
    const descArr = [...desc];
    descArr[i - 1] = votes.toString();

    embed.setDescription(descArr.join(""));
    reaction.message.edit({ embed }).catch(() => {});
  }
};

const MessageReactionAddEvent: Event = {
  name: "messageReactionAdd",
  run: messageReactionAdd,
};

module.exports = MessageReactionAddEvent;
