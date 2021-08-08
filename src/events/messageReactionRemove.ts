import Client from "../structures/Client";
import { MessageReaction, User } from "discord.js";
import Event from "../structures/Event";
import Game, { GameState } from "../schemas/Game";

const messageReactionRemove = async (client: Client, reaction: MessageReaction, user: User) => {
  if (!reaction.me || !reaction.count) return;
  if (user?.bot) return;

  const game = await Game.findOne({ textChannel: reaction.message.channel.id });
  if (!game || game.state === GameState.FINISHED || !game.players.includes(user.id)) return;

  const votes = reaction.count - 1;

  const embed = reaction.message.embeds[0];
  if (!embed?.description) return;
  let desc = embed.description;

  const i = desc.indexOf("/");
  if (i === -1) return;

  // convert to array to manipulate string
  const descArr = [...desc];
  descArr[i - 1] = votes.toString();

  embed.setDescription(descArr.join(""));
  reaction.message.edit({ embeds: [embed] }).catch(() => {});
};

const MessageReactionRemoveEvent: Event = {
  name: "messageReactionRemove",
  run: messageReactionRemove,
};

module.exports = MessageReactionRemoveEvent;
