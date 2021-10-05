import React, { useEffect } from "react";
import { emailVerification } from "../lib/User";
import { useParams } from "react-router-dom";

const Verification = () => {
  const { code } = useParams();

  useEffect(() => {
    async function check() {
      let result = await emailVerification(code);

      if (result.result === "ok") {
        alert("인증되었습니다.");
        window.location.href = "/";
      } else {
        alert("에러발생 : " + result.errorMsg);
        window.location.href = "/";
      }
    }
    check();
  });
  return <div></div>;
};

export default Verification;
