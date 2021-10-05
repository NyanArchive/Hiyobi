import React, { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment";
import BoardCommentWrapper from "./BoardCommentWrapper";
import { getUserId, isLogined } from "../../lib/User";
import { Button, ButtonGroup } from "reactstrap";
import { DeleteComment } from "../../lib/Board";
import BoardCommentWrite from "./BoardCommentWrite";
import GalleryLink from "../GalleryLink";

const BoardComment = ({ data, onSubmit, depth }) => {
  const [highlight, setHighlight] = useState(false);
  const [isWriteMode, setWriteMode] = useState(false);
  if (typeof depth === "undefined") {
    depth = 0;
  }

  const onClickDeleteComment = async (id) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      let result = await DeleteComment(id);
      if (result === true) {
        alert("삭제되었습니다.");
        //onchange
      }
    }
  };

  const innerLinkToPreviewComponent = (data) => {
    let replace = "https://hiyobi.me/reader/";
    let splited = data.split(new RegExp(`${replace}([0-9a-zA-Z]{1,7})`, "img"));

    for (let i = 1; i <= splited.length; i += 2) {
      if (i >= splited.length) break;
      splited[i] = (
        <GalleryLink key={i} id={splited[i]}>
          {replace + splited[i]}
        </GalleryLink>
      );
    }
    return splited;
  };

  useEffect(() => {
    //댓글 하이라이트 있을경우
    setHighlight(false);
    if (window.location.hash) {
      let hash = window.location.hash.slice(1);
      if (Number(hash) === data.id) {
        setHighlight(true);
      }
    }
  }, [data.id]);

  const onCommentSubmit = () => {
    setWriteMode(false);
    onSubmit();
  };

  return (
    <>
      <CommentWrap id={`comment_${data.id}`} highlight={highlight}>
        <b>{data.name}</b> {moment(data.date * 1000).format("YY/MM/DD HH:mm")}
        <span style={{ marginLeft: 5 }}>
          {isLogined() && (
            <CommentButton
              onClick={(e) => setWriteMode(!isWriteMode)}
              size="sm"
              color="link"
            >
              답글
            </CommentButton>
          )}
          {getUserId() === data.userid && (
            <CommentButton
              onClick={(e) => {
                onClickDeleteComment(data.id);
                return false;
              }}
              size="sm"
              color="link"
            >
              삭제
            </CommentButton>
          )}
        </span>
        <br />
        <br />
        {depth === 0 && data.parentid !== 0 && (
          <span style={{ color: "grey" }}>(대댓글원글삭제됨) </span>
        )}
        <CommentArea>{innerLinkToPreviewComponent(data.memo)}</CommentArea>
        <br />
      </CommentWrap>
      <hr style={{ margin: 0 }} />
      {isWriteMode && (
        <BoardCommentWrite
          writeid={data.writeid}
          parentid={data.id}
          onSubmit={onCommentSubmit}
        />
      )}
      {data.child && (
        <ChildArea>
          {data.child.map((val) => (
            <BoardCommentWrapper
              key={val.id}
              data={val}
              depth={depth + 1}
              onSubmit={onSubmit}
            />
          ))}
        </ChildArea>
      )}
    </>
  );
};

const CommentWrap = styled.div`
  padding: 16px 0;
  background-color: ${(props) => (props.highlight ? "lightyellow" : null)};
`;

const CommentArea = styled.span`
  white-space: pre-line;
`;

const ChildArea = styled.div`
  margin-left: 20px;
`;

const CommentButton = styled.button`
  all: unset;
  cursor: pointer;
  margin-left: 4px;

  background-color: lightblue;
  border-radius: 5px;
  padding: 0 5px;

  &:hover {
    text-decoration: underline;
  }
  &:focus {
    outline: orange 5px auto;
  }
`;

export default BoardComment;
