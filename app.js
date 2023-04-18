import getInput from "./input.js";
import { parseService, parseYaml, convertToYaml, parsePipeline } from "./parser.js";
import { httpGet, httpPost, httpPut, httpPostYaml } from "./api.js";
import { unixToHuman } from "./converters.js";
import util from "util";
// const util = require("util");

// const readline = require("./input");

const accountId = "6_vVHzo9Qeu9fXvj-AcbCQ";

const main = async () => {
  console.log("VIENNA - Harness API");

  // check for API key
  if (!process.env.HARNESS_API_KEY) {
    throw new Error("Error! Missing HARNESS_API_KEY variable. Exiting");
  }

  // source Cruise YAML definition from file for sample purposes
  // the parseYaml() function to be replaced by whatever actual input mechanism is
  const mainConfig = parseYaml();

  // service manager
  //   await serviceManager(mainConfig);
  await pipelineManager(mainConfig);

  // Handle service upserts
  //   mainConfig.components.forEach((x) => handleService(x));

  // Handle pipeline upserts

  //   console.log("RESPONSE OUTSIDE FUNCTION", ressi);
  console.log("main complete");
};

const createEnvironment = () => {
  console.log("Create env...");
  let url = `https://app.harness.io/gateway/ng/api/environmentsV2?accountIdentifier=${accountId}`;
  let body = {
    // this is only required in
    type: "PreProduction",
  };
  httpPost(url, body);
};

const pipelineManager = async (config) => {
  // TODO: how does this get sourced?
  const pipelineName = "api-created-pipeline";
  // these are required query params for pipeline API calls
  let pipeId = "tester";
  const queryParams = {
    pipelineIdentifier: pipelineName.replace("-", ""),
    accountIdentifier: accountId,
    orgIdentifier: "SE_Sandbox",
    projectIdentifier: "W_Inc",
  };
  let pipeStatus = { name: "test", status: "pending" };

  const pipelineExists = await checkPipelineExists(queryParams);
  if (pipelineExists) pipeStatus.status = "doesNotExist";
  // No upsert for pipelines - must check to see if it exists
  await handlePipeline(config, queryParams, pipelineName);
};

// orchestrates service calls
const serviceManager = async (config) => {
  //
  let services = [];
  config.components.forEach((x) => services.push({ name: x.name, status: "pending" }));
  console.log("SERVICES TO MANAGE:", services);

  // iterate through services to deploy
  //   fullLog(config);
  for (let i of services) {
    const serviceConfig = config.components.find((x) => i.name === x.name);
    const res = await handleService(serviceConfig);
    if (res.status === "SUCCESS") {
      i.status = "success";
      console.log(services);
    } else {
      console.log("Service creation failed");
    }
    // console.log(serviceConfig);
  }

  //   services.forEach((x) =>
  //     // get config
  //     const configuration = config.components.find((x) => name === x.name)
  //   );

  // make pipeline
};

const handleService = async (serviceConfig) => {
  console.log("Service Handler: Checking service...", serviceConfig.name);

  // define Harness identifier for service
  const serviceId = serviceConfig.name;

  // translation: Cruise to Harness config structure
  const harnessConfig = parseService(serviceConfig);

  // convert to yaml
  const serviceYaml = convertToYaml(harnessConfig);

  // upsert service - make API call to Harness
  const serviceCreation = await upsertService(serviceYaml, serviceConfig.name);

  // check response
  if (serviceCreation.status === "SUCCESS") {
    console.log(
      "SERVICE CREATED:",
      serviceCreation.data.service.name,
      "- created on:",
      unixToHuman(serviceCreation.data.createdAt),
      "last modified:",
      serviceCreation.data.lastModifiedAt
    );
  } else {
    return { status: "FAILURE" };
  }

  return serviceCreation;

  // check to see if service exists
  //   if (!checkServiceExists(serviceIdentifier)) {
  //     // create service
  //   } else {
  //     // do something
  //   }
};

/**
 * Handle pipeline
 */

const handlePipeline = async (serviceConfig, query, pipelineName) => {
  console.log("Pipeline Handler: Checking...");

  // define Harness identifier for service
  const serviceId = serviceConfig.name;

  // translation: Cruise to Harness config structure
  const harnessConfig = parsePipeline(serviceConfig, query, pipelineName);

  // convert to yaml
  const serviceYaml = convertToYaml(harnessConfig);
  console.log(serviceYaml);

  // upsert service - make API call to Harness
  const pipelineCreation = await createPipeline(serviceYaml, query);

  //   // check response
  //   if (serviceCreation.status === "SUCCESS") {
  //     console.log(
  //       "SERVICE CREATED:",
  //       serviceCreation.data.service.name,
  //       "- created on:",
  //       unixToHuman(serviceCreation.data.createdAt),
  //       "last modified:",
  //       serviceCreation.data.lastModifiedAt
  //     );
  //   } else {
  //     return { status: "FAILURE" };
  //   }

  //   return serviceCreation;

  // check to see if service exists
  //   if (!checkServiceExists(serviceIdentifier)) {
  //     // create service
  //   } else {
  //     // do something
  //   }
};

const createPipeline = async (serviceYaml, query) => {
  // let url = https://app.harness.io/gateway/pipeline/api/pipelines/v2?accountIdentifier=string&orgIdentifier=string&projectIdentifier=string&branch=string&repoIdentifier=string&rootFolder=string&filePath=string&commitMsg=string&isNewBranch=false&baseBranch=string&connectorRef=string&storeType=INLINE&repoName=string' \

  console.log("Creating pipeline...");
  let url = `https://app.harness.io/gateway/pipeline/api/pipelines/v2?accountIdentifier=${query.accountIdentifier}&orgIdentifier=${query.orgIdentifier}&projectIdentifier=${query.projectIdentifier}`;
  const result = await httpPostYaml(url, serviceYaml);
  console.log(result);
  return result;
};

const checkPipelineExists = async (query) => {
  let url = `https://app.harness.io/gateway/pipeline/api/pipelines/${query.pipelineIdentifier}?accountIdentifier=${query.accountIdentifier}&orgIdentifier=${query.orgIdentifier}&projectIdentifier=${query.projectIdentifier}`;
  const result = await httpGet(url);

  if (result.code === "SUCCESS_CONDITION") {
    return true;
  } else if (result.code === "ENTITY_NOT_FOUND") {
    return false;
  } else {
    console.log("Unexpected pipeline return message");
    throw new Error("Unexpected pipeline status");
  }

  console.log(result);
  // let url = `https://app.harness.io/gateway/pipeline/api/pipelines/v2?accountIdentifier=string&orgIdentifier=string&projectIdentifier=string&branch=string&repoIdentifier=string&rootFolder=string&filePath=string&commitMsg=string&isNewBranch=false&baseBranch=string&connectorRef=string&storeType=INLINE&repoName=string`
};

const upsertService = (serviceYaml, id) => {
  let url = `https://app.harness.io/gateway/ng/api/servicesV2/upsert?accountIdentifier=${accountId}`;
  const payload = {
    yaml: serviceYaml,
    identifier: id,
    // project and org identifiers should be specified in the request
    orgIdentifier: "SE_Sandbox",
    projectIdentifier: "W_Inc",
  };

  const call = httpPut(url, payload);
  //   console.log("CALL", call);

  // 400
  //   if (call.code === "RESOURCE_NOT_FOUND_EXCEPTION") {
  //     return false;
  //   }
  // make this an explicit match
  return call;
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
