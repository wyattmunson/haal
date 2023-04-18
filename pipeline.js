import { httpGet, httpPostYaml, httpPutYaml } from "./api.js";
import { parsePipeline, convertToYaml } from "./parser.js";
import accountConfig from "./config.json" assert { type: "json" };
const accountId = accountConfig.accountIdentifier;

export const pipelineManager = async (config) => {
  console.log("--------------------\n     PIPELINE      \n--------------------");
  // TODO: how does this get sourced?
  const pipelineName = "api-created-pipeline";
  // these are required query params for pipeline API calls
  let pipeId = "tester";
  const queryParams = {
    pipelineName: pipelineName,
    pipelineIdentifier: pipelineName.replaceAll("-", ""),
    accountIdentifier: accountId,
    orgIdentifier: accountConfig.orgIdentifier,
    projectIdentifier: accountConfig.projectIdentifier,
  };
  let pipeStatus = { name: "test", status: "pending" };

  const pipelineExists = await checkPipelineExists(queryParams);
  console.log("Exists?", pipelineExists);

  if (pipelineExists) pipeStatus.status = "updating";
  if (!pipelineExists) pipeStatus.status = "creating";
  // No upsert for pipelines - must check to see if it exists
  await handlePipeline(config, queryParams, pipelineExists);
};

const handlePipeline = async (serviceConfig, query, pipelineExists) => {
  console.log("Generating pipeline configuration...");

  // define Harness identifier for service
  const serviceId = serviceConfig.name;

  // translation: abstraction YAML spec to Harness config structure
  const harnessConfig = parsePipeline(serviceConfig, query);

  // convert to yaml
  const serviceYaml = convertToYaml(harnessConfig);

  // create or update pipeline - make API call to Harness
  if (pipelineExists) {
    console.log("Pipeline exists, updating...");
    const pipelineUpdate = await updatePipeline(serviceYaml, query);
    console.log("Pipeline updated!");
  } else {
    console.log("Pipeline does not exist, creating...");
    const pipelineCreation = await createPipeline(serviceYaml, query);
    console.log("Pipeline created!");
  }
};

const createPipeline = async (serviceYaml, query) => {
  console.log("Creating pipeline...");
  let url = `https://app.harness.io/gateway/pipeline/api/pipelines/v2?accountIdentifier=${query.accountIdentifier}&orgIdentifier=${query.orgIdentifier}&projectIdentifier=${query.projectIdentifier}`;
  const result = await httpPostYaml(url, serviceYaml);
  return result;
};

const updatePipeline = async (serviceYaml, query) => {
  console.log("Updating pipeline...");
  let url = `https://app.harness.io/gateway/pipeline/api/pipelines/v2/${query.pipelineIdentifier}?accountIdentifier=${query.accountIdentifier}&orgIdentifier=${query.orgIdentifier}&projectIdentifier=${query.projectIdentifier}`;
  const result = await httpPutYaml(url, serviceYaml);
  return result;
};

const checkPipelineExists = async (query) => {
  let url = `https://app.harness.io/gateway/pipeline/api/pipelines/summary/${query.pipelineIdentifier}?accountIdentifier=${query.accountIdentifier}&orgIdentifier=${query.orgIdentifier}&projectIdentifier=${query.projectIdentifier}`;
  const result = await httpGet(url);

  if (result.status === "SUCCESS") {
    return true;
  } else if (result.code === "ENTITY_NOT_FOUND") {
    return false;
  } else {
    console.log("Unexpected pipeline return message: ", result.code);
    throw new Error("Unexpected pipeline status");
  }
};
