import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/navbar/Navbar";
import { Container } from "reactstrap";
import GalleryBlock from "../components/gallery/GalleryBlock";
import styled from "styled-components";
import { galleryCount, pagingCount } from "../lib/Constants";
import { getBookmark, deleteBookmark, isLogined } from "../lib/User";
import { GalleryInfo } from "../lib/Gallery";
import Paging from "../components/Paging";
import { useParams } from "react-router-dom";
import ModalPortal from "../components/modal/ModalPortal";
import Login from "../components/modal/Login";

const Bookmark = () => {
  let { page } = useParams();

  page = Number(page);
  if (typeof page === "undefined" || !Number.isInteger(page)) {
    page = 1;
  }

  const [list, setList] = useState([]);
  const [count, setCount] = useState(1);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const getBookmarkList = useCallback(
    () =>
      new Promise(async (resolve, reject) => {
        try {
          let result = await getBookmark({ paging: page });

          let Promises = [];
          for (let i in result.list) {
            Promises.push(
              new Promise(async (resolve, reject) => {
                let val = result.list[i];
                if (val.galleryid !== null) {
                  let info = await GalleryInfo(val.galleryid);
                  val.info = info;
                  val.block = (
                    <GalleryBlock
                      style={{ marginBottom: 0 }}
                      key={val.galleryid}
                      data={info}
                    />
                  );
                } else {
                  val.block = (
                    <SearchDiv>
                      <a href={`/search/${val.search}`} target="_blank">
                        {val.search}
                      </a>
                    </SearchDiv>
                  );
                }
                resolve(val);
              })
            );
          }
          Promise.all(Promises).then((val) => {
            result.list = val;
            resolve(result);
          });
        } catch (e) {
          console.error(e);
          alert(e);
        }
      }),
    [page]
  );

  const delBookmark = async (id) => {
    if (window.confirm("삭제하시겠습니까?")) {
      try {
        let result = await deleteBookmark(id);

        if (result === true) {
          alert("삭제되었습니다.");

          let result = await getBookmarkList();
          setList(result.list);
          setCount(result.count);
        } else {
          alert(result);
        }
      } catch (e) {
        alert(e);
      }
    }
  };

  useEffect(() => {
    async function fetchBookmark() {
      if (!isLogined()) {
        alert("로그인이 필요합니다.");
        setLoginOpen(true);
        return;
      }
      setList([]);

      try {
        let result = await getBookmarkList();
        setList(result.list);
        setCount(result.count);
      } catch (e) {
        console.error(e);
        alert(e);
      }
    }
    fetchBookmark();

    document.title = `북마크 ${page}페이지 - hiyobi.me`;
  }, [getBookmarkList, page]);

  return (
    <>
      <Navbar />
      <Container>
        <BookmarkTable>
          <thead className="thead-dark">
            <tr>
              <th scope="col">내용</th>
              <th scope="col">삭제</th>
            </tr>
          </thead>
          <tbody>
            {list.length !== 0
              ? list.map((val) => (
                  <tr key={val.id}>
                    <td>{val.block}</td>
                    <td>
                      <button
                        onClick={() => delBookmark(val.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              : "로딩중.."}
          </tbody>
        </BookmarkTable>
        <Paging
          url={"/bookmark"}
          count={count}
          page={page}
          pagingRow={pagingCount}
          contentCount={galleryCount}
          showSelector
        />
      </Container>
      <ModalPortal>
        <Login
          isOpen={isLoginOpen}
          onChange={(e) => {
            setLoginOpen(e);
          }}
        />
      </ModalPortal>
    </>
  );
};

let BookmarkTable = styled.table`
  width: 100%;
  & > thead > tr {
    background-color: black;
    color: white;
  }
  & > thead > tr > th {
    padding: 0.75rem;
  }
`;

let SearchDiv = styled.div`
  height: 70px;
  line-height: 50px;

  & > a {
    font-size: 20px;
    color: black;
    font-weight: bold;
  }

  border: 0.0625rem rgba(0, 0, 0, 0.16) solid;
  box-shadow: 0 0.1875rem 0.1875rem 0 rgba(0, 0, 0, 0.16),
    0 0 0 0.0625rem rgba(0, 0, 0, 0.08);
  border-radius: 0.1875rem;
  padding: 10px;
`;

export default Bookmark;
