const mentionsStr = (users: string[], delimiter: string = "") => {
  let str = "";
  for (const u of users) str += `<@${u}>${delimiter}`;
  return str.slice(0, -1 * delimiter.length);
};

export default mentionsStr;
