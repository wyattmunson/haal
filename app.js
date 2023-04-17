import readline from "./input.js";
// const readline = require("./input");

const main = async () => {
  // get user input
  //   const tester = readline.question(`What is your name?`, (name) => {
  //     console.log(`Hello ${name}`);
  //     readline.close();
  //     return name;
  //   });

  console.log("we got es6");
  const response = await getInput();
  console.log("RESPONSE was", response);
  console.log("FINAL CODE BRANCH");
};

const getInput = () => {
  readline.question(`What is your name?`, (name) => {
    console.log(`Hello ${name}`);
    readline.close();
    return name;
  });
  //   const tester = readline.question(`What is your name?`, (name) => {
  //     console.log(`Hello ${name}`);
  //     readline.close();
  //     return name;
  //   });
};

main();
