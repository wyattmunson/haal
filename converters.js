export const unixToHuman = (time) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const dateObject = new Date(time);
  return dateObject.toLocaleDateString("en-US", options);
};
