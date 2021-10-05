import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/navbar/Navbar";
import { Container, Button } from "reactstrap";
import GalleryBlock from "../components/gallery/GalleryBlock";
import { Random } from "../lib/Gallery";
import SearchAutoComplete from "../components/SearchAutoComplete";
const RandomPage = () => {
  let defaultblock = Array.apply(null, Array(5)).map((val, i) => (
    <GalleryBlock key={i} />
  ));
  const [blocks, setBlocks] = useState(defaultblock);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  document.title = "랜덤페이지 - hiyobi.me";

  const fetchRandom = useCallback(async () => {
    setIsLoading(true);
    setBlocks(
      Array.apply(null, Array(5)).map((val, i) => <GalleryBlock key={i} />)
    );
    let list = await Random(tags);
    if (list.length === 0) {
      setBlocks("결과없음");
    } else {
      list = list.map((val) => <GalleryBlock key={val.id} data={val} />);
      setBlocks(list);
    }
    setIsLoading(false);
  }, [tags]);

  const onChangeTag = async (tag) => {
    setTags(tag);
  };

  useEffect(() => {
    async function getRandom() {
      await fetchRandom();
      window.scrollTo(0, 0);
    }

    getRandom();
  }, [fetchRandom]);

  return (
    <>
      <Navbar />
      <Container>
        <SearchAutoComplete
          onChange={onChangeTag}
          placeholder="랜덤 조건 추가"
        />
        <Button
          onClick={fetchRandom}
          color="success"
          disabled={isLoading}
          style={{ width: "100%", marginBottom: 10 }}
        >
          {isLoading ? (
            "로딩중..."
          ) : (
            <>
              <span className="oi oi-random" /> 랜덤
            </>
          )}
        </Button>
        {blocks}
        <Button
          onClick={fetchRandom}
          color="success"
          disabled={isLoading}
          style={{ width: "100%", marginBottom: 10 }}
        >
          {isLoading ? (
            "로딩중..."
          ) : (
            <>
              <span className="oi oi-random" /> 랜덤
            </>
          )}
        </Button>
      </Container>
    </>
  );
};

export default RandomPage;
