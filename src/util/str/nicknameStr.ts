import { IPlayer } from "../../schemas/Player";

const nicknameStr = (player: IPlayer) => {
  if (player.nickname) return player.nickname;
  return `[${player.elo}] ${player.name}`;
};

export default nicknameStr;
