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
      //   console.log("SUCCESS", res);
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
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) {
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