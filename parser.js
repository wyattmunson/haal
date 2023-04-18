import yaml from "js-yaml";
import fs from "fs";
import util from "util";

const fullLog = (object) => {
  console.log(util.inspect(object, { showHidden: false, depth: null, colors: true }));
};

export const parseYaml = () => {
  // get from file
  const data = fs.readFileSync("./abstraction.yaml", "utf8");
  let obj = yaml.load(data);

  return obj;
};

export const convertToYaml = (json) => {
  return yaml.dump(json);
  //   const yamlData = yaml.dump(json);
  //   console.log(yamlData);
};

const generateArtifacts = (artifact) => {
  return {
    primary: {
      primaryArtifactRef: "<+input>",
      sources: [
        {
          spec: {
            connectorRef: "sampledocker",
            imagePath: artifact.repositories.prod,
            tag: "<+input>",
          },
          identifier: `${artifact.name}-image`,
          type: "DockerRegistry",
        },
      ],
    },
  };
};

const generateManifests = (manifest) => {
  return {
    manifest: {
      identifier: "helm",
      type: "HelmChart",
      spec: {
        store: {
          type: "Github",
          spec: {
            connectorRef: "samplegithub",
            gitFetchType: "Branch",
            folderPath: manifest.chart,
            repoName: "harness-helm",
            branch: "main",
          },
        },
        subChartName: "",
        skipResourceVersioning: false,
        enableDeclarativeRollback: false,
        helmVersion: "V3",
      },
    },
  };
};

export const parseService = (serviceManifest) => {
  let artifacts = generateArtifacts(serviceManifest.artifacts[0]["docker-images"][0]);
  let manifests = generateManifests(serviceManifest.artifacts[0]);
  let serviceJson = {
    service: {
      name: serviceManifest.name,
      identifier: serviceManifest.name.replace("-", ""),
      serviceDefinition: {
        type: "Kubernetes",
        spec: {
          manifests: [manifests],
          artifacts: {
            artifacts,
          },
        },
      },
      gitOpsEnabled: false,
    },
  };

  //   fullLog(serviceJson);
  return serviceJson;
};

export const parsePipeline = (config, query) => {
  // get envs - a deployment stage will be created for each env
  let envs = config.components[0].artifacts[0]["beta-values-files"];
  let stageNames = [];
  let stages = [];
  for (let i in envs) {
    stageNames.push(i);
  }
  console.log("Creating environments:", stageNames);

  //   console.log("Stage Names", stageNames);
  stageNames.forEach((x) => {
    stages.push(stageGenerator(x));
  });

  //   console.log("ALL STAGES:", stages);

  let pipelineJson = {
    pipeline: {
      name: query.pipelineName,
      identifier: query.pipelineIdentifier.replace("-", ""),
      projectIdentifier: query.projectIdentifier,
      orgIdentifier: query.orgIdentifier,
      stages: stages,
    },
  };
  //   fullLog(pipelineJson);
  return pipelineJson;
};

const stageGenerator = (name) => {
  // using templates
  return {
    stage: {
      name: `deploy ${name}`,
      identifier: `deploy_${name}`,
      template: {
        templateRef: "basicrollingdeploy",
        versionLabel: "0.1.0",
        templateInputs: {
          type: "Deployment",
          spec: {
            service: {
              serviceInputs: {
                serviceDefinition: {
                  type: "Kubernetes",
                  spec: {
                    service: {
                      serviceInputs: {
                        serviceDefinition: {
                          type: "Kubernetes",
                          spec: {
                            artifacts: {
                              artifacts: {
                                primary: {
                                  primaryArtifactRef: "<+input>",
                                  sources: {
                                    // TODO: parameterize this
                                    identifier: "releasinator-example/webapp-image",
                                    type: "DockerRegistry",
                                    spec: {
                                      tag: "<+input>",
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            environment: {
              environmentRef: name,
              infrastructureDefinitions: [{ identifier: `${name}_infra` }],
            },
          },
        },
      },
    },
  };
};
