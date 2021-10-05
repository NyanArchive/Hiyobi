import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import moment from "moment";
import BoardCommentWrapper from "../board/BoardCommentWrapper";
import { getUserId, isLogined } from "../../lib/User";
import { apifetch } from "../../lib/Fetch";
import Skeleton from "react-loading-skeleton";
import { Button } from "reactstrap";
import { DeleteComment } from "../../lib/Board";

const GalleryComment = (props) => {
  const [isLoading, setLoading] = useState(true);
  const [isSubmiting, setSubmiting] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(props.data);

  const getComments = useCallback(async () => {
    try {
      setLoading(true);
      let result = await apifetch({
        url: `/gallery/${props.id}/comments`,
        method: "get",
      });
      setComments(result);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert(e);
    }
  });

  const submitComment = async () => {
    setSubmiting(true);
    try {
      let result = await apifetch({
        url: "/gallery/comments/write",
        method: "post",
        data: {
          id: props.id,
          comment: comment,
        },
      });

      setSubmiting(false);
      if (result.errorMsg) {
        alert(result.errorMsg);
      } else {
        setComment("");
        getComments();
      }
    } catch (e) {
      alert(e);
      setSubmiting(false);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      let result = await apifetch({
        url: "/gallery/comments/delete",
        method: "POST",
        data: {
          id: id,
        },
      });

      if (result.errorMsg) {
        alert(result.errorMsg);
      } else {
        alert("삭제완료");
        getComments();
      }
    } catch (e) {
      alert("에러 발생");
    }
  };

  useEffect(() => {
    if (typeof comments === "undefined") {
      getComments();
    }
  }, [comments, getComments]);

  if (isLoading === true) {
    return (
      <List>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </List>
    );
  }

  return (
    <>
      <List>
        {comments.length === 0 && (
          <ListItem
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            댓글 없음
          </ListItem>
        )}
        {comments.map((val) => (
          <ListItem>
            <div>
              <span className="name">{val.name}</span> at{" "}
              {moment(val.date * 1000).format("YY/MM/DD HH:mm:ss")}
              {getUserId() === val.userid && (
                <span
                  onClick={() => deleteComment(val.id)}
                  style={{ cursor: "pointer", marginLeft: 5 }}
                >
                  <span className="oi oi-trash" />
                </span>
              )}
            </div>
            {val.comment}
          </ListItem>
        ))}
      </List>
      <WriteArea>
        <textarea
          style={{ resize: "none" }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={!isLogined() && "로그인이 필요합니다"}
          disabled={!isLogined() || isSubmiting}
        />
        <Button disabled={!isLogined() || isSubmiting} onClick={submitComment}>
          등록
        </Button>
      </WriteArea>
    </>
  );
};

const List = styled.ul`
  list-style: none;
  width: 100%;
  padding: 0;
`;

const ListItem = styled.li`
  list-style: none;
  background-color: lightgray;
  border-radius: 5px;
  margin-top: 5px;

  &::first-child {
    margin-top: 0;
  }

  & .name {
    font-weight: bold;
  }
`;

const WriteArea = styled.div`
  display: flex;
  width: 100%;
  height: 38px;

  justify-content: center;
  align-items: center;

  & textarea {
    flex: 1;
    height: 38px;
  }
`;

export default GalleryComment;
