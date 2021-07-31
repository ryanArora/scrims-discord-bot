const getFileExtension = (f: string) => {
  // https://stackoverflow.com/a/1203361
  const arr = f.split(".");
  if (arr.length === 1 || (arr[0] === "" && arr.length === 2)) return "";

  const popped = arr.pop();
  if (!popped) return "";

  return popped;
};

export default getFileExtension;
