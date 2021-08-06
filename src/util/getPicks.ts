const getPicks = (players: number, pickNumber: number) => {
  if (players === 8 && (pickNumber === 1 || pickNumber === 2)) return 2;
  if (players === 6 && pickNumber === 1) return 2;

  return 1;
};

export default getPicks;
