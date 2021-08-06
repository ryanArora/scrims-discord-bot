const percentageStr = (num: number, den: number, sig: number) => {
  if (num === 0 && den === 0) return (0).toFixed(sig) + "%";
  return ((num / den) * 100).toFixed(sig) + "%";
};

export default percentageStr;
