import { GuildMember } from "discord.js";
import Player, { IPlayer } from "../schemas/Player";

const getPlayerUpdateNickname = (member: GuildMember, uuid: string, name: string) => {
  return new Promise<IPlayer>((resolve, reject) => {
    const discordId = member.user.id;

    Player.findOne({ discordId })
      .then((player: IPlayer | null) => {
        if (player) {
          player.name = name;
          player.uuid = uuid;
        } else {
          player = new Player({
            discordId,
            name,
            uuid,
            elo: 0,
            wins: 0,
            losses: 0,
            wlr: 0,
            mvps: 0,
            winstreak: 0,
            losestreak: 0,
            winstreakHigh: 0,
            eloHigh: 0,
            games: [],
          });
        }

        player
          .save()
          .then((p) => {
            resolve(p);
            member.setNickname(`[${p.elo}] ${p.name}`).catch((err) => {});
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

export default getPlayerUpdateNickname;
