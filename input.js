import readline from "readline";

// const readline = rl.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

const getInput = (question) => {
  //   return new Promise((resolve) => {
  //     const rl = readline.createInterface({
  //       input: process.stdin,
  //       out: process.stdout,
  //     });
  //     rl.question(question, (ans) => {
  //       rl.close();
  //       resolve(ans);
  //     });
  //   });
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

export default getInput;
