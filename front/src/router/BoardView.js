import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/navbar/Navbar";
import { Container } from "reactstrap";
import styled from "styled-components";
import moment from "moment";
import { View, DeleteWrite, buildCommentTree, List } from "../lib/Board";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { getUserId } from "../lib/User";
import Skeleton from "react-loading-skeleton";
import queryString from "query-string";
import BoardCommentWrapper from "../components/board/BoardCommentWrapper";
import BoardCommentWrite from "../components/board/BoardCommentWrite";
import Boards from "../components/board/Boards";

const BoardView = () => {
  const [board, setBoard] = useState();
  const [boards, setBoards] = useState();

  let paging = 0;
  const { search } = useLocation();
  let query = queryString.parse(search);
  const history = useHistory();

  if (typeof query.p !== "undefined") {
    paging = Number(query.p);
  }

  let { viewid } = useParams();
  viewid = Number(viewid);
  if (typeof viewid === "undefined") {
    viewid = 1;
  }

  const onClickDelete = async () => {
    if (window.confirm("글을 삭제하시겠습니까?")) {
      let result = await DeleteWrite(board.id);
      if (result === true) {
        alert("삭제되었습니다.");
        history.push("/board");
      }
    }
  };

  const getBoardData = useCallback(async () => {
    setBoard(null);
    let result = await View(viewid);
    result.comment = buildCommentTree(result.comment);
    setBoard(result);
    document.title = `${result.title} - hiyobi.me`;
  }, [viewid]);

  useEffect(() => {
    async function getBoard() {
      await getBoardData();

      //댓글 하이라이트 있을경우
      if (window.location.hash) {
        let hash = window.location.hash.slice(1);
        let elem = document.getElementById("comment_" + hash);
        if (elem !== null)
          window.scrollTo({ top: elem.offsetTop, behavior: "smooth" });
      }
    }
    async function getBoards() {
      let boards = await List(paging);
      setBoards(boards);
    }

    getBoard();
    getBoards();
  }, [getBoardData, paging, viewid]);

  return (
    <>
      <Navbar />
      <Container style={{ fontSize: 12 }}>
        {board ? (
          <>
            <HeadTable>
              <tbody>
                <tr>
                  <td>이름</td>
                  <td>
                    <b>{board.name}</b>
                  </td>
                </tr>
                <tr>
                  <td>날짜</td>
                  <td>
                    {moment(board.date * 1000).format("YYYY/MM/DD HH:mm")}
                  </td>
                </tr>
                <tr>
                  <td>제목</td>
                  <td>{board.title}</td>
                </tr>
              </tbody>
            </HeadTable>
            <br />
            <br />
            <ContentArea
              id="memo"
              dangerouslySetInnerHTML={{ __html: board.memo }}
            />
            <br />
            <br />
            <br />
            <br />
            <hr />
            {board.comment.length !== 0 &&
              board.comment.map((comment) => (
                <BoardCommentWrapper
                  key={comment.id}
                  data={comment}
                  onSubmit={getBoardData}
                />
              ))}
            <BoardCommentWrite writeid={board.id} onSubmit={getBoardData} />
            {getUserId() === board.userid && (
              <button
                onClick={onClickDelete}
                id=""
                type="submit"
                className="btn btn-outline-danger"
              >
                <span className="oi oi-trash"></span> 글삭제
              </button>
            )}
          </>
        ) : (
          <>
            <HeadTable>
              <tbody>
                <tr>
                  <td colSpan={2}>
                    <Skeleton />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <Skeleton />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <Skeleton />
                  </td>
                </tr>
              </tbody>
            </HeadTable>
            <br />
            <br />
            <Skeleton height={500} />
            <br />
            <br />
            <br />
            <br />
            <hr />
          </>
        )}

        <hr style={{ marginTop: 100 }} />

        <Boards data={boards} paging={paging} />
      </Container>
    </>
  );
};

const HeadTable = styled.table`
  width: 100%;
  border-top: 2px solid grey;
  border-bottom: 2px solid grey;
`;

const ContentArea = styled.p`
  white-space: pre-line;

  & img {
    max-width: 100%;
  }
`;

const CommentArea = styled.span`
  white-space: pre-line;
`;

export default BoardView;
