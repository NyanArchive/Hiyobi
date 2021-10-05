import React, { useState, useEffect } from "react";
import { Container, Button } from "reactstrap";
import { useParams, useLocation, useHistory, NavLink } from "react-router-dom";
import { boardCount, boardPagingCount } from "../../lib/Constants";
import Paging from "../Paging";
import queryString from "query-string";
import Skeleton from "react-loading-skeleton";
import BoardListMobile from "./BoardListMobile";
import { isMobile } from "react-device-detect";
import moment from "moment";
import styled from "styled-components";
const activeClassName = "board-lg-category";

const Boards = (props) => {
  const [boards, setBoards] = useState();
  const [paging, setPaging] = useState(0);
  const [count, setCount] = useState(0);

  const { location, search } = useLocation();
  const history = useHistory();

  let query = queryString.parse(search);

  useEffect(() => {
    if (typeof props.data !== "undefined") {
      setBoards(props.data.list);
      setCount(props.data.count);
    }
    if (props.paging != paging) {
      setBoards();
      setPaging(props.paging);
    }
  }, [paging, props.data, props.paging]);

  const onSearch = (e) => {
    let searchStr = document.getElementById("searchstr").value;
    let searchType = document.getElementById("searchtype").value;
    history.push(`/board/list/1?s_type=${searchType}&s_str=${searchStr}`);
    e.preventDefault();
  };

  return (
    <>
      <BBSTable className="d-none d-md-block">
        <thead>
          <tr>
            <th style={{ width: "3%" }} name="id">
              번호
            </th>
            <th style={{ width: "50%" }} name="title">
              제목
            </th>
            <th style={{ width: "10%" }} name="name">
              글쓴이
            </th>
            <th style={{ width: "5%" }} name="date">
              날짜
            </th>
            <th style={{ width: "5%" }} name="cnt">
              조회수
            </th>
          </tr>
        </thead>
        <tbody>
          {boards
            ? boards.map((val) => (
                <tr key={val.id}>
                  <td name="id">{val.id}</td>
                  <td name="title">
                    <CategoryTag
                      to={`/board?c=${val.category}`}
                      activeClassName={activeClassName}
                    >
                      {val.categoryname}
                    </CategoryTag>
                    {val.imgcount > 0 && (
                      <img
                        style={{ width: 14, height: 14, marginRight: 5 }}
                        src="/picture_icon.png"
                        alt="img"
                      />
                    )}
                    <NavLink
                      className={val.isnoti ? "font-weight-bold" : null}
                      to={`/board/${val.id}?p=${paging}`}
                    >
                      {val.title}
                    </NavLink>
                    {val.cmtcnt !== 0 && <b> {val.cmtcnt}</b>}
                  </td>
                  <td name="name">{val.name}</td>
                  <td name="date">
                    {moment(val.date * 1000).format("MM/DD HH:mm")}
                  </td>
                  <td name="cnt">{val.cnt}</td>
                </tr>
              ))
            : Array.apply(null, Array(boardCount)).map((val, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <Skeleton />
                  </td>
                </tr>
              ))}
          {boards && boards.length === 0 && (
            <tr>
              <td
                style={{ fontWeight: "bold", fontSize: 20, height: 100 }}
                colSpan="6"
              >
                결과없음
              </td>
            </tr>
          )}
        </tbody>
      </BBSTable>

      <ul className="d-sm-block d-md-none p-0">
        {boards ? (
          boards.map((val) => (
            <BoardListMobile key={val.id} data={val} paging={paging} />
          ))
        ) : (
          <Skeleton height={50} count={boardCount} />
        )}
      </ul>

      <form onSubmit={onSearch} style={{ marginBottom: 10 }}>
        <select id="searchtype" defaultValue={query.s_type && query.s_type}>
          <option value="1">제목+내용</option>
          <option value="2">제목</option>
          <option value="3">글쓴이</option>
        </select>
        <input id="searchstr" type="text" defaultValue={query.s_str} />
        <input type="submit" value="검색" />
      </form>
      <Paging
        url={"/board/list"}
        search={search}
        page={paging}
        count={count}
        pagingRow={boardPagingCount}
        contentCount={boardCount}
      />
      <Button tag={NavLink} to="/board/write" outline color="dark">
        <span className="oi oi-pencil" /> 글쓰기
      </Button>
    </>
  );
};
/*
const CategoryTag = styled.NavLink`
  padding: 2px 5px;
  color: white;
  background-color: grey;
  text-align: center;
  margin-right: 10px;
  
  &:hover, &:link {
    text-decoration: none;
    color: white;
  }
`
*/

const CategoryTag = styled(NavLink).attrs({
  activeClassName,
})`
  padding: 2px 10px;
  color: white;
  background-color: grey;
  text-align: center;
  margin-right: 7px;
  border-radius: 15px;

  &.${activeClassName} {
    color: white;
  }
  &.${activeClassName}:hover {
    text-decoration: none;
    color: white;
  }
`;

const BBSTable = styled.table`
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
  margin-bottom: 10px;
  table-layout: fixed;

  & thead tr {
    border-bottom: 1px lightgrey solid;
  }

  & thead th {
    height: 30px;
    vertical-align: middle;
    text-align: center;
  }

  & tbody tr {
    text-align: center;
    vertical-align: middle;
  }
  & tbody tr:hover {
    background-color: #e6e6e6;
  }

  & td {
    height: 35px;
    vertical-align: middle;
    text-align: center;
    border-bottom: 1px lightgrey solid;
  }

  & tbody td[name="title"] {
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 300px;
  }
  & tbody a {
    color: black;
    text-decoration: none;
  }
  & tbody a:hover {
    color: #0056b3;
    text-decoration: underline;
  }
`;

export default Boards;
