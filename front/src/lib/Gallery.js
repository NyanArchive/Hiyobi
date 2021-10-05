import { apifetch, jsonfetch } from "./Fetch";
import { CDNURL } from "../lib/Constants";

export const Search = async ({ search, paging }) => {
  if (typeof paging === "undefined" || !Number.isInteger(paging)) {
    paging = 1;
  }
  if (typeof search === "string") {
    search = search.split("|");
  }

  try {
    let result = await apifetch({
      url: "/search",
      method: "post",
      data: {
        search: search,
        paging: paging,
      },
    });

    return result;
  } catch (e) {
    console.error(e);
  }
};

export const List = async (paging) => {
  if (typeof paging === "undefined" || !Number.isInteger(paging)) {
    paging = 1;
  }
  try {
    let result = await apifetch({
      url: "/list/" + paging,
      method: "get",
    });

    return result;
  } catch (e) {
    console.error(e);
  }
};

export const GalleryInfo = async (galleryid) => {
  try {
    let result = await apifetch({
      url: "/gallery/" + galleryid,
      method: "get",
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const Random = async (tags) => {
  try {
    let result = await apifetch({
      url: "/random",
      method: "post",
      data: {
        search: tags,
      },
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const GetGalleryListJson = async (id) => {
  try {
    let data = await jsonfetch({
      url: CDNURL + "/json/" + id + "_list.json",
      method: "get",
    });
    return data;
  } catch (e) {
    throw new Error("데이터 가져오기 실패");
  }
};
