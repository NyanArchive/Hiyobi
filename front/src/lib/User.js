import { apifetch } from "./Fetch";
import Cookie from "js-cookie";

export const Login = async ({ email, password, isRemember }) => {
  if (typeof email === "undefined" || email === "") {
    throw new Error("이메일을 입력해주세요");
  }
  if (typeof password === "undefined" || password === "") {
    throw new Error("비밀번호를 입력해주세요");
  }
  let data = {
    email: email,
    password: password,
  };

  if (typeof isRemember !== "undefined") {
    data.remember = true;
  }

  try {
    let result = await apifetch({
      url: "/user/login",
      method: "post",
      data: data,
    });

    if (result.result === "ok") {
      saveUserInfo(result.data);
      return result;
    } else {
      return result;
    }
  } catch (e) {
    throw e;
  }
};

export const Logout = async () => {
  try {
    let result = await apifetch({
      url: "/user/logout",
      method: "post",
    });

    if (result.result === "ok") {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
};

export const Register = async ({ email, name, password }) => {
  if (typeof email === "undefined" || email === "") {
    throw new Error("이메일을 입력해주세요");
  }
  if (typeof name === "undefined" || name === "") {
    throw new Error("비밀번호를 입력해주세요");
  }
  if (typeof password === "undefined" || password === "") {
    throw new Error("비밀번호를 입력해주세요");
  }

  try {
    let result = await apifetch({
      url: "/user/register",
      method: "post",
      data: {
        email: email,
        name: name,
        password: password,
      },
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const unRegister = async () => {
  if (!isLogined()) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    let result = await apifetch({
      url: "/user/unregister",
      method: "post",
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const changePassword = async (password) => {
  if (!isLogined()) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    let result = await apifetch({
      url: "/user/password",
      method: "post",
      data: {
        password: password,
      },
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const saveUserInfo = (user) => {
  if (typeof user === "undefined") {
    return false;
  }

  if (typeof user.token !== "undefined") {
    Cookie.set("token", user.token, { expires: 365 });
  }
  if (typeof user.name !== "undefined") {
    Cookie.set("name", user.name);
  }
  if (typeof user.id !== "undefined") {
    Cookie.set("id", user.id);
  }
  return true;
};

export const unSetUserInfo = () => {
  Cookie.remove("token");
  Cookie.remove("name");
  Cookie.remove("id");
};

export const getUserInfo = async () => {
  try {
    let result = await apifetch({
      url: "/user/info",
      method: "get",
    });

    if (result.result === "ok") {
      saveUserInfo(result.data);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
};

export const isLogined = () => {
  let token = Cookie.get("token");
  if (typeof token === "undefined") {
    return false;
  } else {
    return true;
  }
};

export const getUserId = () => {
  return Number(Cookie.get("id"));
};
export const getUserName = () => {
  return Cookie.get("name");
};
export const getUserEmail = () => {
  return Cookie.get("email");
};
export const getUserToken = () => {
  return Cookie.get("token");
};

export const getBookmark = async ({ type, paging }) => {
  if (!isLogined()) {
    alert("로그인이 필요합니다.");
    return;
  }
  /*
  if (typeof type === 'undefined') {
    throw new Error('종류를 정해주세요')
  }
  */
  if (isNaN(paging)) {
    throw new Error("invalid paging");
  }

  try {
    let result = await apifetch({
      url: "/bookmark/" + paging,
      method: "post",
      data: {
        type: type,
        paging: paging,
      },
    });

    if (result.errorMsg) {
      throw new Error("북마크를 가져오는 도중 에러가 발생했습니다.");
    } else {
      return result;
    }
  } catch (e) {
    throw e;
  }
};

export const setBookmark = async ({ search, galleryid }) => {
  if (!isLogined()) {
    alert("로그인이 필요합니다.");
    return;
  }

  if (typeof search === "undefined" && typeof galleryid === "undefined") {
    throw new Error("invalid bookmark");
  }
  try {
    let result = await apifetch({
      url: "/bookmark/add",
      method: "post",
      data: {
        search: search,
        galleryid: galleryid,
      },
    });

    if (result.result === "ok") {
      alert("북마크 추가완료");
      return true;
    } else if (result.errorMsg) {
      alert(result.errorMsg);
      return false;
    }
  } catch (e) {
    throw new Error("북마크를 추가하는 도중 에러가 발생했습니다.");
  }
};

export const deleteBookmark = async (bookmarkid) => {
  if (isNaN(bookmarkid)) {
    throw new Error("invalid bookmarkid");
  }
  try {
    let result = await apifetch({
      url: "/bookmark/" + bookmarkid,
      method: "delete",
    });

    if (result.result === "ok") {
      return true;
    } else {
      return result.errorMsg;
    }
  } catch (e) {
    console.error(e);
    throw new Error("북마크를 삭제하는 도중 에러가 발생했습니다.");
  }
};

export const emailVerification = async (code) => {
  if (typeof code === "undefined" || code === "") {
    throw new Error("정상적인 요청이 아닙니다.");
  }

  try {
    let result = await apifetch({
      url: "/user/verfication",
      method: "post",
      data: {
        code: code,
      },
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const resendVerificationMail = async (email) => {
  if (typeof email === "undefined") {
    throw new Error("이메일을 입력해주세요");
  }
  try {
    let result = await apifetch({
      url: "/user/resendverfication",
      method: "post",
      data: {
        email: email,
      },
    });

    return result;
  } catch (e) {
    throw e;
  }
};

export const getNotifications = async () => {
  if (!isLogined()) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    let result = await apifetch({
      url: "/user/notification",
      method: "get",
    });

    if (result.errorMsg) {
      throw new Error(result.errorMsg);
    } else {
      return result.data;
    }
  } catch (e) {
    throw e;
  }
};

export const readNotification = async (notiid) => {
  if (!isLogined()) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    let result = await apifetch({
      url: "/user/notification/read/" + notiid,
      method: "get",
    });

    if (result.errorMsg) {
      throw new Error(result.errorMsg);
    } else {
      return true;
    }
  } catch (e) {
    throw e;
  }
};

export const readAllNotification = async () => {
  if (!isLogined()) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    let result = await apifetch({
      url: "/user/notification/readall",
      method: "get",
    });

    if (result.errorMsg) {
      throw new Error(result.errorMsg);
    } else {
      return true;
    }
  } catch (e) {
    throw e;
  }
};
