// import { logme } from "./log";

export const httpGet = (url) => {
  console.log("Using endpoint:", url);
  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.HARNESS_API_KEY,
    },
  })
    .then((res) => {
      console.log(res.status);
      if (res.status === 401) throw new Error("Unauthorized");
      if (res.status === 500) throw new Error("Upstream error");

      //   if (!res.ok) {
      //     console.log("API CALL FAILED");
      //     console.error(res.json());
      //     // console.error(res);
      //     throw new Error();
      //   }
      return res.json();
    })
    .then((res) => {
      console.log("SUCCESS: API call to", url);
      // log body:
      //   logme(res, 2);
      return res;
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPut = (url, body) => {
  console.log("Using endpoint:", url);
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
      console.log("SUCCESS: API call to", url);
      // console.log("SUCCESS", res);
      return res;
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPost = (url, body) => {
  console.log("Using endpoint:", url);
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
      console.log("SUCCESS", res);
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPostYaml = (url, body) => {
  console.log("Using endpoint:", url);
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
        console.error(res);
        throw new Error();
      }
      return res.json();
    })
    .then((res) => {
      console.log("SUCCESS", res);
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};

export const httpPutYaml = (url, body) => {
  console.log("Using endpoint:", url);
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
        console.error(res);
        throw new Error();
      }
      return res.json();
    })
    .then((res) => {
      console.log("SUCCESS", res);
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
};
