import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/navbar/Navbar";
import { Container, Button } from "reactstrap";
import { List, Search } from "../lib/Board";
import queryString from "query-string";
import { useParams, useLocation, useHistory, NavLink } from "react-router-dom";
import { isMobile } from "react-device-detect";
import Boards from "../components/board/Boards";

const Board = (props) => {
  const [boards, setBoards] = useState();

  let { paging } = useParams();
  const { search } = useLocation();
  paging = Number(paging);

  if (typeof paging === "undefined" || !Number.isInteger(paging)) {
    paging = 1;
  }

  const getBoard = useCallback(async () => {
    setBoards();
    let boards;
    let query = queryString.parse(search);

    //검색쿼리가 있을경우
    if (
      typeof query.s_type !== "undefined" ||
      typeof query.s_str !== "undefined" ||
      typeof query.c !== "undefined"
    ) {
      boards = await Search({
        paging: paging,
        searchType: query.s_type,
        searchStr: query.s_str,
        category: query.c,
      });
    } else {
      boards = await List(paging);
    }

    document.title = `게시판 ${paging}페이지 - hiyobi.me`;

    setBoards(boards);
  }, [paging, search]);

  useEffect(() => {
    async function getBoards() {
      await getBoard();
    }

    getBoards();
  }, [getBoard]);

  return (
    <>
      <Navbar />
      <Container fluid={isMobile} style={{ padding: isMobile ? 0 : null }}>
        <Boards data={boards} paging={paging} />
      </Container>
    </>
  );
};

export default Board;
