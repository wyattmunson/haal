import { logme } from "./log.js";

export const httpGet = (url) => {
  logme(`Using endpoint: ${url}`, 2);
  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.HARNESS_API_KEY,
    },
  })
    .then((res) => {
      // non-2xx calls may be desirable
      if (res.status === 401) throw new Error("Unauthorized");
      if (res.status === 500) throw new Error("Upstream error");
      console.log("resolved");
      return res.json();
    })
    .then((res) => {
      logme(`SUCCESS: API call to ${url}`, 2);
      logme(`Response: ${res}`, 3);
      return res;
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPut = (url, body) => {
  logme(`Using endpoint: ${url}`, 2);
  return fetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.HARNESS_API_KEY,
    },
  })
    .then((res) => {
      if (res.status === 401) throw new Error("Unauthorized");
      if (res.status === 500) throw new Error("Upstream error");
      return res.json();
    })
    .then((res) => {
      logme(`SUCCESS: API call to ${url}`, 2);
      // console.log("SUCCESS", res);
      return res;
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPost = (url, body) => {
  logme(`Using endpoint: ${url}`, 2);
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.HARNESS_API_KEY,
    },
  })
    .then((res) => {
      if (res.status === 401 || res.status >= 500) {
        console.log("API CALL FAILED");
        console.error(res);
        throw new Error();
      }
      return res.json();
    })
    .then((res) => {
      logme(`SUCCESS: API call to ${url}`, 2);
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPostYaml = (url, body) => {
  logme(`Using endpoint: ${url}`, 2);
  return fetch(url, {
    method: "POST",
    body: body,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/yaml",
      "x-api-key": process.env.HARNESS_API_KEY,
    },
  })
    .then((res) => {
      if (res.status === 401) {
        console.log("API CALL FAILED");
        // console.error(res);
        throw new Error();
      }
      return res.json();
    })
    .then((res) => {
      logme(`SUCCESS: API call to ${url}`, 2);
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPutYaml = (url, body) => {
  logme(`Using endpoint: ${url}`, 2);
  return fetch(url, {
    method: "PUT",
    body: body,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/yaml",
      "x-api-key": process.env.HARNESS_API_KEY,
    },
  })
    .then((res) => {
      if (res.status === 401) {
        console.log("API CALL FAILED");
        // console.error(res);
        throw new Error();
      }
      return res.json();
    })
    .then((res) => {
      logme(`SUCCESS: API call to ${url}`, 2);
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};
