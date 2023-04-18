import { httpGet, httpPostYaml, httpPutYaml } from "./api.js";
import { parsePipeline, convertToYaml } from "./parser.js";
const accountId = "6_vVHzo9Qeu9fXvj-AcbCQ";

export const pipelineManager = async (config) => {
  // TODO: how does this get sourced?
  const pipelineName = "api-created-pipeline";
  // these are required query params for pipeline API calls
  let pipeId = "tester";
  const queryParams = {
    pipelineName: pipelineName,
    pipelineIdentifier: pipelineName.replaceAll("-", ""),
    accountIdentifier: accountId,
    orgIdentifier: "SE_Sandbox",
    projectIdentifier: "W_Inc",
  };
  let pipeStatus = { name: "test", status: "pending" };

  const pipelineExists = await checkPipelineExists(queryParams);
  console.log("Exists?", pipelineExists);
  //   return;
  if (pipelineExists) pipeStatus.status = "updating";
  if (!pipelineExists) pipeStatus.status = "creating";
  // No upsert for pipelines - must check to see if it exists
  await handlePipeline(config, queryParams, pipelineExists);
};

/**
 * Handle pipeline
 */

const handlePipeline = async (serviceConfig, query, pipelineExists) => {
  console.log("Pipeline Handler: Checking...");

  // define Harness identifier for service
  const serviceId = serviceConfig.name;

  // translation: Cruise to Harness config structure
  const harnessConfig = parsePipeline(serviceConfig, query);

  // convert to yaml
  const serviceYaml = convertToYaml(harnessConfig);
  console.log(serviceYaml);

  // create or update pipeline - make API call to Harness
  if (pipelineExists) {
    console.log("Pipeline exists, updating...");
    const pipelineUpdate = await updatePipeline(serviceYaml, query);
  } else {
    console.log("Pipeline does not exist, creating...");
    const pipelineCreation = await createPipeline(serviceYaml, query);
  }

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

const updatePipeline = async (serviceYaml, query) => {
  console.log("Updating pipeline...");
  let url = `https://app.harness.io/gateway/pipeline/api/pipelines/v2/${query.pipelineIdentifier}?accountIdentifier=${query.accountIdentifier}&orgIdentifier=${query.orgIdentifier}&projectIdentifier=${query.projectIdentifier}`;
  const result = await httpPutYaml(url, serviceYaml);
  console.log(result);
  return result;
};

const checkPipelineExists = async (query) => {
  let url = `https://app.harness.io/gateway/pipeline/api/pipelines/summary/${query.pipelineIdentifier}?accountIdentifier=${query.accountIdentifier}&orgIdentifier=${query.orgIdentifier}&projectIdentifier=${query.projectIdentifier}`;
  const result = await httpGet(url);
  console.log(result);

  if (result.status === "SUCCESS") {
    return true;
  } else if (result.code === "ENTITY_NOT_FOUND") {
    return false;
  } else {
    console.log("Unexpected pipeline return message: ", result.code);
    throw new Error("Unexpected pipeline status");
  }

  console.log(result);
  // let url = `https://app.harness.io/gateway/pipeline/api/pipelines/v2?accountIdentifier=string&orgIdentifier=string&projectIdentifier=string&branch=string&repoIdentifier=string&rootFolder=string&filePath=string&commitMsg=string&isNewBranch=false&baseBranch=string&connectorRef=string&storeType=INLINE&repoName=string`
};
// https://app.harness.io/gateway/pipeline/api/pipelines/v2/apicreatedpipeline?accountIdentifier=6_vVHzo9Qeu9fXvj-AcbCQ&projectIdentifier=W_Inc&orgIdentifier=SE_Sandbox
// https://app.harness.io/gateway/pipeline/api/pipelines/v2/apicreatedpipeline?accountIdentifier=6_vVHzo9Qeu9fXvj-AcbCQ&projectIdentifier=W_Inc&orgIdentifier=SE_Sandbox
