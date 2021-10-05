import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { Container } from "reactstrap";
import GalleryBlock from "../components/gallery/GalleryBlock";
import { GalleryInfo as getGalleryInfo } from "../lib/Gallery";
import { useParams } from "react-router-dom";

const GalleryInfo = () => {
  const { gallid } = useParams();
  const [info, setInfo] = useState();

  useEffect(() => {
    async function getInfo() {
      try {
        let result = await getGalleryInfo(gallid);
        setInfo(result);
        document.title = `${result.title} - hiyobi.me`;
      } catch (e) {
        alert("오류발생 : " + e);
      }
    }
    if (typeof info === "undefined") {
      getInfo();
    }
  });

  return (
    <>
      <Navbar />
      <Container>{info ? <GalleryBlock data={info} /> : "로딩중..."}</Container>
    </>
  );
};

export default GalleryInfo;
