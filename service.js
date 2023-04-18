import { parseService, convertToYaml } from "./parser.js";
import { httpPut } from "./api.js";
import { unixToHuman } from "./converters.js";
import accountConfig from "./config.json" assert { type: "json" };

const accountId = accountConfig.accountIdentifier;

export const serviceManager = async (config) => {
  console.log("--------------------\n      SERVICES      \n--------------------");

  let services = [];
  config.components.forEach((x) => services.push({ name: x.name, status: "pending" }));
  console.log("SERVICES TO MANAGE:", services);

  // iterate through services to deploy
  for (let i of services) {
    const serviceConfig = config.components.find((x) => i.name === x.name);
    const res = await handleService(serviceConfig);
    if (res.status === "SUCCESS") {
      i.status = "success";
      console.log(services);
    } else {
      console.log("Service creation failed");
    }
  }
};

const handleService = async (serviceConfig) => {
  console.log("Service Handler: Checking service...", serviceConfig.name);

  // define Harness identifier for service
  const serviceId = serviceConfig.name;

  // translation: Cruise to Harness config structure
  const harnessConfig = parseService(serviceConfig);

  // convert to yaml
  const serviceYaml = convertToYaml(harnessConfig);
  console.log(serviceYaml);

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
      unixToHuman(serviceCreation.data.lastModifiedAt)
    );
  } else {
    return { status: "FAILURE" };
  }

  return serviceCreation;
};

const upsertService = (serviceYaml, id) => {
  let url = `https://app.harness.io/gateway/ng/api/servicesV2/upsert?accountIdentifier=${accountId}`;
  const payload = {
    yaml: serviceYaml,
    identifier: id,
    // project and org identifiers should be specified in the request
    orgIdentifier: accountConfig.orgIdentifier,
    projectIdentifier: accountConfig.projectIdentifier,
  };

  const call = httpPut(url, payload);
  return call;
};
