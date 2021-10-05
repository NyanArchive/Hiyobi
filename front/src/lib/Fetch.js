import * as Constants from "./Constants";
import Cookie from "js-cookie";

export const apifetch = ({ url, method, data }) =>
  new Promise((resolve, reject) => {
    let token = Cookie.get("token");
    let option = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(data),
    };
    if (typeof token !== "undefined") {
      option.headers["Authorization"] = "Bearer " + token;
    }

    return fetch(Constants.APIURL + url, option)
      .then((resp) => resolve(resp.json()))
      .catch((e) => reject(e));
  });

export const apifilefetch = ({ url, method, data }) =>
  new Promise((resolve, reject) => {
    let token = Cookie.get("token");
    let option = {
      method: method,
      headers: {},
      credentials: "same-origin",
      body: data,
    };
    if (typeof token !== "undefined") {
      option.headers["Authorization"] = "Bearer " + token;
    }

    return fetch(Constants.APIURL + url, option)
      .then((resp) => resolve(resp.json()))
      .catch((e) => reject(e));
  });

export const jsonfetch = ({ url, method, data }) =>
  new Promise((resolve, reject) => {
    let option = {
      method: method,
      body: JSON.stringify(data),
    };

    return fetch(url, option)
      .then((resp) => resolve(resp.json()))
      .catch((e) => reject(e));
  });

export const blobfetch = async ({ url, method, data }) => {
  let option = {
    method: method,
    credential: "omit",
    body: data,
  };

  let result = await fetch(url, option);
  return result.blob();
};
