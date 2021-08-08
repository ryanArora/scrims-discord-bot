import { GameState } from "../../schemas/Game";

const gameStateStr = (state: GameState) => {
  if (state === GameState.PICKING) return "Picking";
  else if (state === GameState.PLAYING) return "Playing";
  else if (state === GameState.SCORING) return "Scoring";
  else if (state === GameState.FINISHED) return "Finished";
  return "Unknown State";
};

export default gameStateStr;
