export const logme = (message, level) => {
  const logLevel = 1;
  if (logLevel >= level) {
    console.log(message);
  }
};
