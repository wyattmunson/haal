import { parseService, parseYaml, convertToYaml, parsePipeline } from "./parser.js";
import { httpGet, httpPost, httpPut, httpPostYaml } from "./api.js";
import { unixToHuman } from "./converters.js";
import { pipelineManager } from "./pipeline.js";
import { serviceManager } from "./service.js";
import util from "util";

const accountId = "dNg7t7xEQkWV0LjivvOlcw";

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

const checkServiceExists = async (serviceIdentifier) => {
  let url = `https://app.harness.io/gateway/ng/api/servicesV2/${serviceIdentifier}?accountIdentifier=${accountId}&orgIdentifier=SE_Sandbox&projectIdentifier=W_Inc`;
  // let url = `https://app.harness.io/gateway/ng/api/servicesV2/{serviceIdentifier}?accountIdentifier=${accountId}&orgIdentifier=string&projectIdentifier=string&deleted=false${accountId}`
  //   const payload = {
  //     identifier: identifier,
  //     projectIdentifier: projectId,
  //   };

  const call = await httpGet(url);
  console.log("CALL", call);

  // 400
  if (call.code === "RESOURCE_NOT_FOUND_EXCEPTION") {
    return false;
  }
  // make this an explicit match
  return true;
};

const fullLog = (object) => {
  console.log(util.inspect(object, { showHidden: false, depth: null, colors: true }));
};

main();
