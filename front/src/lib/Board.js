import { apifetch } from "./Fetch";

export const List = async (paging) => {
  if (typeof paging === "undefined" || !Number.isInteger(paging)) {
    paging = 1;
  }
  try {
    let result = await apifetch({
      url: "/board/list/" + paging,
      method: "get",
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const View = async (id) => {
  if (typeof id === "undefined" || !Number.isInteger(id)) {
    return false;
  }
  try {
    let result = await apifetch({
      url: "/board/" + id,
      method: "get",
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const Search = async ({ searchType, searchStr, category, paging }) => {
  if (typeof paging === "undefined" || !Number.isInteger(paging)) {
    paging = 1;
  }
  if (typeof searchType === "string") searchType = Number(searchType);
  if (typeof category === "string") category = Number(category);

  try {
    let result = await apifetch({
      url: "/board/search/" + paging,
      method: "post",
      data: {
        type: searchType,
        search: searchStr,
        category: category,
      },
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const Write = async ({ title, category, content, images }) => {
  if (typeof title === "undefined") {
    throw new Error("no title");
  }
  if (typeof category === "undefined") {
    throw new Error("no category");
  }
  if (typeof content === "undefined") {
    throw new Error("no content");
  }

  try {
    let result = await apifetch({
      url: "/board/write",
      method: "post",
      data: {
        title: title,
        category: category,
        content: content,
        images: images,
      },
    });

    return result.writeid;
  } catch (e) {
    throw e;
  }
};

export const WriteComment = async ({ writeid, parentid, content }) => {
  if (typeof writeid === "undefined") {
    throw new Error("no title");
  }
  if (typeof content === "undefined") {
    throw new Error("no content");
  }

  try {
    let result = await apifetch({
      url: "/board/writecomment",
      method: "post",
      data: {
        writeid: writeid,
        parentid: parentid,
        content: content,
      },
    });
    return result;
  } catch (e) {
    throw e;
  }
};

export const DeleteWrite = async (writeid) => {
  if (isNaN(writeid)) {
    throw new Error("invalid writeid");
  }

  try {
    let result = await apifetch({
      url: "/board/" + writeid,
      method: "delete",
    });

    if (result.result === "ok") {
      return true;
    } else {
      alert(result.errorMsg);
      return false;
    }
  } catch (e) {
    throw e;
  }
};

export const DeleteComment = async (commentid) => {
  if (isNaN(commentid)) {
    throw new Error("invalid writeid");
  }

  try {
    let result = await apifetch({
      url: "/board/comment/" + commentid,
      method: "delete",
    });

    if (result.result === "ok") {
      return true;
    } else {
      alert(result.errorMsg);
      return false;
    }
  } catch (e) {
    throw e;
  }
};

export const getNotice = async () => {
  try {
    let result = await apifetch({
      url: "/notice",
      method: "get",
    });

    if (result.result === "ok") {
      return result.data;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
};

export const buildCommentTree = (comments) => {
  if (typeof comments === "undefined") {
    return [];
  }

  for (let i = comments.length - 1; i >= 0; i--) {
    let comment = comments[i];

    if (comment.parentid !== 0) {
      for (let j = comments.length - 1; j >= 0; j--) {
        if (i === j || comments[j] === null) continue;
        let search = comments[j];

        if (comment.parentid === search.id) {
          if (typeof search.child === "undefined") {
            search.child = [];
          }
          search.child.unshift(comment);
          comments[i] = null;
          break;
        }
      }
    }
  }

  comments = comments.filter((val) => {
    if (val === null) {
      return false;
    }
    return true;
  });

  return comments;
};
