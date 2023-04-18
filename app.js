import { parseYaml } from "./parser.js";
import { pipelineManager } from "./pipeline.js";
import { serviceManager } from "./service.js";

const main = async () => {
  console.log("HAAL - Harness API Abstraction Layer");

  // check for API key
  if (!process.env.HARNESS_API_KEY) {
    throw new Error("Error! Missing HARNESS_API_KEY variable. Exiting");
  }

  // source abstraction YAML spec from file for demo purposes
  // the parseYaml() function to be replaced by whatever actual input mechanism is
  const mainConfig = parseYaml();

  // service manager
  await serviceManager(mainConfig);
  await pipelineManager(mainConfig);

  console.log("Completed successfully. Exiting...");
};

main();
