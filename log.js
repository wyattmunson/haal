export const logme = (message, level) => {
  const logLevel = 2;
  if (logLevel >= level) {
    console.log(message);
  }
};
