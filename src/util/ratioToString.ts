const ratioToString = (num: number, den: number, sig: number) => {
  if (num > 0 && den === 0) return "∞";
  if (num === 0 && den === 0) return (0).toFixed(sig);
  return (num / den).toFixed(sig);
};

export default ratioToString;
