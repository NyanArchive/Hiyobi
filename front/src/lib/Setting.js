import Cookie from "js-cookie";

export const getGalleryBlockType = () => {
  let type = Cookie.get("blocktype");

  if (typeof type === "undefined") {
    type = "blur";
  }
  return type;
};

export const setGalleryBlockType = (type) => {
  if (typeof type === "undefined" || (type !== "blur" && type !== "delete")) {
    type = "blur";
  }
  Cookie.set("blocktype", type, { expires: 365 });
};

export const getGalleryBlock = () => {
  return Cookie.get("blockedtags");
};

export const setGalleryBlock = (string) => {
  Cookie.set("blockedtags", string, { expires: 365 });
};
