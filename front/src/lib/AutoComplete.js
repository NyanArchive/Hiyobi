import { APIURL } from "./Constants";
import { jsonfetch } from "./Fetch";

export const getAutoComplete = () =>
  new Promise(async (resolve, reject) => {
    let autoversion = window.localStorage["auto_version"];
    let auto_data = window.localStorage["auto_data"];
    let date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    //데이터 최신화
    if (typeof auto_data === "undefined" || time > autoversion + 86400) {
      let url =
        process.env.NODE_ENV === "production"
          ? "/auto.json"
          : APIURL + "/auto.json";
      let json = await jsonfetch({
        url: url,
        method: "get",
      });

      resolve(json);
    } else {
      resolve(auto_data);
    }
  });
