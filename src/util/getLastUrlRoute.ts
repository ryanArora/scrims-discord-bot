const getLastUrlRoute = (url: string) => {
  const arr = url.split("/");
  const popped = arr.pop();

  return popped ? popped : "";
};

export default getLastUrlRoute;
