export const APIURL =
  process.env.NODE_ENV === "production"
    ? "https://api.hiyobi.me"
    : "http://localhost:4000";
export const CDNURL = "https://cdn.hiyobi.me";
export const USERIMGURL = "https://userimg.hiyobi.me";

export const galleryCount = 15;
export const pagingCount = 10;

export const boardCount = 20;
export const boardPagingCount = 10;
