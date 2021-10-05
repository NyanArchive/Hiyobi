import React, { useState, useEffect } from "react";
import { isLogined, getUserId } from "../../lib/User";
import { WriteComment } from "../../lib/Board";
import { Button } from "reactstrap";

const BoardCommentWrite = ({ writeid, parentid, onSubmit }) => {
  const [writeText, setWriteText] = useState("");
  const [writeLoading, setWriteLoading] = useState(false);

  const submitComment = async () => {
    setWriteLoading(true);
    if (writeText === "") {
      alert("댓글 내용이 없습니다.");
      return;
    }

    try {
      let result = await WriteComment({
        writeid: writeid,
        parentid: parentid,
        content: writeText,
      });
      setWriteLoading(false);

      if (result.result === "ok") {
        setWriteText("");
        onSubmit();
      } else {
        alert("에러발생 : " + result.errorMsg);
      }
    } catch (e) {
      alert("에러발생 : " + e);
      setWriteLoading(false);
    }
  };

  return (
    <>
      <textarea
        disabled={!isLogined()}
        placeholder={!isLogined() ? "로그인이 필요합니다." : ""}
        value={writeText}
        onChange={(e) => setWriteText(e.target.value)}
        style={{ width: "100%" }}
        rows="4"
      />
      <br />
      <Button
        disabled={!isLogined() || writeLoading}
        onClick={submitComment}
        outline
        color="dark"
      >
        <span className="oi oi-pencil" />
        {writeLoading ? "전송중" : " 댓글쓰기"}
      </Button>
    </>
  );
};

export default BoardCommentWrite;
