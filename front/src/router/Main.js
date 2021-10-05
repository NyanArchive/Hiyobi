import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { Container } from "reactstrap";
import GalleryBlock from "../components/gallery/GalleryBlock";
import styled from "styled-components";
import { List, Search } from "../lib/Gallery";
import { useParams, useLocation } from "react-router-dom";
import Paging from "../components/Paging";
import { pagingCount, galleryCount } from "../lib/Constants";
import SearchBar from "../components/SearchBar";

const defaultblock = Array.apply(null, Array(galleryCount)).map((val, i) => (
  <GalleryBlock key={i} dummy />
));

const Main = (props) => {
  const [Blocks, setBlocks] = useState(defaultblock);
  const [count, setCount] = useState();
  const [pagingurl, setPagingURL] = useState("/list");

  const location = useLocation();
  let { paging, searchstr } = useParams();

  paging = Number(paging);
  if (typeof paging === "undefined" || !Number.isInteger(paging)) {
    paging = 1;
  }

  document.title = "hiyobi.me";

  useEffect(() => {
    async function fetchGallery() {
      try {
        setBlocks(defaultblock);
        let result = [];
        if (searchstr) {
          result = await Search({ search: searchstr, paging: paging });
          setPagingURL("/search/" + searchstr);
        } else {
          result = await List(paging);
          setPagingURL("/list");
        }
        let blocks = result.list.map((val) => (
          <GalleryBlock key={val.id} data={val} />
        ));
        setBlocks(blocks);
        setCount(result.count);
      } catch (e) {
        console.error(e);
      }
    }

    fetchGallery();
  }, [paging, searchstr]);

  return (
    <>
      <Navbar />
      <Container>
        {location.pathname.startsWith("/search") && (
          <SearchBar search={location.pathname.replace("/search/", "")} />
        )}
        {Blocks}
        <Paging
          url={pagingurl}
          page={paging}
          count={count}
          pagingRow={pagingCount}
          contentCount={galleryCount}
          showSelector
        />
      </Container>
    </>
  );
};

const GalleryBlocks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export default Main;
