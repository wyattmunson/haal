# 🔴 HAAL

Harness API abstraction layer.

## Setup

Export the `HARNESS_API_KEY` variable in the current terminal session.

## Concepts

### Services

Services are created first.

- Iterate though `components` field to get all services as part of the pipeline (these services will be deployed together as part of the same pipeline)
- Create each Service via API, with reference to artifact location, image name and tag, and chart location

### Pipeline

Pipelines are created after service configuration.

- Use `beta-values-files` to create a list of environment names
- For each environment listed, create a deployment Stage using a Stage Template
- Template inputs are:
  - Environment name
  - Service identifier
  - Image tag (defined by webhook)

### Templates

Easily create pipelines with deployment stages pre-defined. Use abstraction YAML to define a list of deployment environments and create a deployment stage for each environment.

Templates are identified with a unique identifier and version tag.

```js
template: {
    templateRef: "basicrollingdeploy",
    versionLabel: "0.1.0",
    templateInputs: {
        ...
    }
```

### Governance through code

When pipelines are created or updated, any OPA policy evaluations are also returned in the API call. Policies can warn about out of compliance pipelines or outright block their saves or executions.

A deny status is returned in `data.governanceMetadata.deny`.

Details about OPA evaluations are in `data.governanceMetadata.details`:

```json
{
  "policyName": "Pipeline - Required Security Approval",
  "severity": "warning",
  "denyMessages": ["Pipeline does not contain required template 'Security_Approval_Template'"],
  "status": "warning",
  "identifier": "Pipeline_Required_Stage_Templates",
  "created": "1679925646198",
  "updated": "1679925646198"
}
```

### Orgs and Projects

The Org and Project identifier should be passed in with every API call. This can be surmised from application name, location, or other field. Omitting these field may impact how you reference Connectors.

The identifiers are defined in `./config.js` for this example.
