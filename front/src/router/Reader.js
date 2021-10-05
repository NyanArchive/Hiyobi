import React, { useState, useEffect } from "react";
import {
  Container,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import Loading from "../components/reader/Loading";
import LoadProgress from "../components/reader/LoadProgress";
import { setBookmark } from "../lib/User";
import styled, { css } from "styled-components";
import { CDNURL } from "../lib/Constants";
import { apifetch, jsonfetch } from "../lib/Fetch";
import { useParams, NavLink as RRNavLink } from "react-router-dom";
import Fullscreen from "react-full-screen";
import Helmet from "react-helmet";
import Cookie from "js-cookie";
import { useCallback } from "react";
import ReaderOverlay from "../components/reader/ReaderOverlay";
import { isMobile } from "react-device-detect";
import FullScreen from "react-full-screen";
import GalleryComment from "../components/gallery/GalleryComment";

const Reader = () => {
  let c_imgfit = Cookie.get("imgfit");
  if (typeof c_imgfit === "undefined") {
    c_imgfit = "height";
  }

  let c_spread = Cookie.get("spread");
  if (typeof c_spread === "undefined") {
    c_spread = false;
  } else {
    c_spread = c_spread === "true";
  }

  let c_viewmode = Cookie.get("viewmode");
  if (typeof c_viewmode === "undefined") {
    c_viewmode = true;
  } else {
    c_viewmode = c_viewmode === "true";
  }

  let c_imgresize = Cookie.get("imgresize");
  if (typeof c_imgresize === "undefined") {
    c_imgresize = true;
  } else {
    c_imgresize = c_imgresize === "true";
  }

  const { readid } = useParams();
  const [isLoading, setLoading] = useState(true);
  const [loadText, setLoadText] = useState("로딩중...");
  const [navCollapse, setNavCollapse] = useState(false);
  const [gallJson, setGallJson] = useState();
  const [gallListJson, setGallListJson] = useState();
  const [imgFit, setImgFit] = useState(c_imgfit);
  const [spread, setSpread] = useState(c_spread); //true : 펼쳐보기, false : 한장보기
  const [viewMode, setViewMode] = useState(c_viewmode); //true : 스크롤, false : 페이징
  const [imgQuality, setimgQuality] = useState(c_imgresize); //true : 모바일 절약보기, false : 원본보기
  const [imgLoaded, setImgLoaded] = useState([]);
  const [currentLoadImg, setcurrentLoadImg] = useState(0);
  const [selectedImg, setSelectedImg] = useState(0);
  const [isOverlayOpen, setOverlayOpen] = useState(true);
  const [isFull, setFull] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [imgList, setImgList] = useState();
  const [commentOpen, setCommentOpen] = useState(false);

  const toggleImgFit = () => {
    switch (imgFit) {
      case "height":
        setImgFit("width");
        Cookie.set("imgfit", "width");
        break;
      case "width":
        setImgFit("height");
        Cookie.set("imgfit", "height");
        break;
      //case 'original': setImgFit('height'); Cookie.set('imgfit', 'height'); break;
      default:
        setImgFit("width");
        Cookie.set("imgfit", "width");
        break;
    }
  };
  const toggleImageQuality = () => {
    Cookie.set("imgresize", !imgQuality);
    setimgQuality(!imgQuality);

    //다시 로드 위해 초기화
    setImgLoaded([]);
    setcurrentLoadImg(0);
  };
  const toggleSpread = () => {
    Cookie.set("spread", !spread);
    setSpread(!spread);
    setImageList();
  };
  const toggleViewMode = () => {
    Cookie.set("viewmode", !viewMode);
    setViewMode(!viewMode);
    setImageList();
  };

  const setImageList = () => {
    viewMode ? setImgList(getScrollImgList()) : setImgList(getPageImgList());
  };

  const onArrowKeyDown = useCallback(
    (e) => {
      let next;
      if (e.keyCode === 37) {
        if (selectedImg !== 0) {
          next = selectedImg - 1;
        }
      } else if (e.keyCode === 39) {
        next = selectedImg + 1;
      }

      if (typeof next !== "undefined") {
        if (viewMode === true) {
          let elem = document.getElementById("scroll_" + next);
          elem.scrollIntoView();
        }
        setSelectedImg(next);
      }
    },
    [selectedImg, viewMode]
  );

  const onLoadImage = (i) => {
    let tmp = [...imgLoaded];
    tmp[i] = true;
    setImgLoaded(tmp);
    setcurrentLoadImg(currentLoadImg + 1);
  };

  const onLoadError = (i) => {
    if (window.confirm(i + "번째 이미지 로드 오류. 다시 로드하시겠습니까?")) {
      setcurrentLoadImg(i - 2);
    } else {
      let tmp = [...imgLoaded];
      tmp[i] = true;
      setImgLoaded(tmp);
      setcurrentLoadImg(currentLoadImg + 1);
    }
  };

  const onChangePageSelect = (val) => {
    if (val < 0) return;

    if (viewMode === true) {
      let elem = document.getElementById("scroll_" + val);
      elem.scrollIntoView();
    }
    setSelectedImg(val);
  };

  const getScrollImgList = () => {
    let list = getImgGroup();
    return list.map((val) => {
      val = val.reverse();
      return (
        <div key={val}>
          {val.map((i, order) => {
            let path = `${CDNURL}/data/${readid}/${gallListJson[i].name}`;
            if (isMobile && imgQuality) {
              let name = gallListJson[i].name.replace(/\.[^/.]+$/, "");
              path = `${CDNURL}/data_r/${readid}/${name}.jpg`;
            }
            let src =
              imgLoaded[i] === true || currentLoadImg === i
                ? path
                : "/ImageLoading.gif";
            return (
              <img
                id={`scroll_${i}`}
                key={i}
                data-id={i}
                data-direction={order === 1 ? "prev" : "next"}
                alt={`${i + 1}번째 이미지`}
                onClick={onClickImg}
                src={src}
              />
            );
          })}
        </div>
      );
    });
  };

  const getPageImgList = () => {
    let group = getGroupByNumber(selectedImg);
    group = group.reverse();
    return (
      <div>
        {group.map((i, order) => {
          let path = `${CDNURL}/data/${readid}/${gallListJson[i].name}`;
          if (isMobile && imgQuality) {
            let name = gallListJson[i].name.replace(/\.[^/.]+$/, "");
            path = `${CDNURL}/data_r/${readid}/${name}.jpg`;
          }
          let src =
            imgLoaded[i] === true || currentLoadImg === i
              ? path
              : "/ImageLoading.gif";
          return (
            <img
              id={`page_${i}`}
              key={i}
              style={{ width: i === 0 ? "100%" : null }}
              data-id={i}
              data-direction={order === 1 ? "prev" : "next"}
              alt={`${i + 1}번째 이미지`}
              onClick={onClickImg}
              src={src}
            />
          );
        })}
      </div>
    );
  };

  const getImgGroup = () => {
    let list = [];
    for (let i = 0; i <= gallListJson.length - 1; i++) {
      let val = gallListJson[i];
      let val2 = gallListJson[i + 1];
      //첫번쨰 이미지일때와 한개보기의 경우 한개 추가
      //다음 이미지 혹은 현재 이미지가 가로 이미지일경우도 한개 추가
      if (
        i === 0 ||
        spread === false ||
        val.width > val.height ||
        typeof val2 === "undefined" ||
        val2.width > val2.height
      ) {
        list.push([i]);
      }

      //펼쳐보기가 켜져있을경우 이미지 두개 추가
      //다음 이미지가 있어야함
      else if (spread === true && typeof val2 !== "undefined") {
        list.push([i, i + 1]);
        //두개 추가했으니 i카운트 1증가
        i++;
      } else {
        list.push([i]);
      }
    }
    return list;
  };

  const getGroupByNumber = (num) => {
    let group = getImgGroup();
    for (let i in group) {
      for (let j in group[i]) {
        if (group[i][j] === num) {
          return group[i];
        }
      }
    }
  };

  const onClickImg = (e) => {
    let id = Number(e.target.getAttribute("data-id"));
    let direction = e.target.getAttribute("data-direction");

    let gotoid = direction === "next" ? id + 1 : id - 1;
    if (typeof gallListJson[gotoid] === "undefined") {
      return;
    }

    if (viewMode === true) {
      let elem = document.getElementById("scroll_" + gotoid);
      elem.scrollIntoView();
    }
    setSelectedImg(gotoid);
  };

  const onOverlayOpen = (val) => {
    setOverlayOpen(val);
  };

  const onScroll = useCallback(
    (e) => {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        //down
        if (isOverlayOpen) setOverlayOpen(false);
      } else {
        //up
        if (!isOverlayOpen) setOverlayOpen(true);
      }

      //detectbottom
      if (!commentOpen) {
        setCommentOpen(
          window.innerHeight + window.pageYOffset >= document.body.offsetHeight
        );
      }
      setLastScrollTop(st);
    },
    [isOverlayOpen, lastScrollTop]
  );

  const toggleOverlayOpen = (e) => {
    if (e.target.tagName !== "IMG") setOverlayOpen((prev) => !prev);
  };

  const onChangeFull = (e) => {
    setFull(e);
  };

  useEffect(() => {
    async function init() {
      setLoadText("로딩중...작품정보 (1/2)");
      let json = await apifetch({ url: `/gallery/${readid}`, method: "get" });
      setGallJson(json);
      setLoadText("로딩중...이미지목록 (2/2)");
      json = await jsonfetch({ url: `${CDNURL}/json/${readid}_list.json` });
      setGallListJson(json);
      setLoading(false);

      let map = json.map(() => false);
      setImgLoaded(map);

      await apifetch({ url: `/gallery/${readid}/view`, method: "get" });
    }

    if (typeof gallJson === "undefined") {
      init();
    }

    document.addEventListener("keydown", onArrowKeyDown, false);
    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("keydown", onArrowKeyDown, false);
      document.removeEventListener("scroll", onScroll);
    };
  }, [onArrowKeyDown, readid, lastScrollTop, gallJson, onScroll]);

  return (
    <>
      {gallJson && (
        <Helmet>
          <title>{gallJson.title} - hiyobi.me</title>
        </Helmet>
      )}
      <Loading isLoading={isLoading} text={loadText} />
      {isLoading === false && (
        <LoadProgress
          loading={currentLoadImg < gallListJson.length}
          total={gallListJson.length}
          current={currentLoadImg}
        />
      )}

      {!isLoading && (
        <ReaderOverlay
          info={gallJson}
          list={gallListJson}
          isOpen={isOverlayOpen}
          spread={spread}
          onChangeOpen={onOverlayOpen}
          viewMode={viewMode}
          onClickViewMode={toggleViewMode}
          spread={spread}
          onClickSpread={toggleSpread}
          imgFit={imgFit}
          onClickImgFit={toggleImgFit}
          imgQuality={imgQuality}
          onClickImageQuality={toggleImageQuality}
          selectedImg={selectedImg}
          onChangeSelectedImg={onChangePageSelect}
          onClickFull={() => setFull(true)}
        />
      )}
      <div style={{ height: 45 }}></div>
      {isLoading === false && (
        <>
          <FullScreen enabled={isFull} onChange={onChangeFull}>
            <ImgArea
              fit={imgFit}
              spread={spread}
              viewMode={viewMode}
              onClick={toggleOverlayOpen}
            >
              {viewMode ? getScrollImgList() : getPageImgList()}
            </ImgArea>
            {commentOpen && (
              <ImgArea
                style={{
                  height: "100%",
                  textAlign: "left",
                  padding: "0.5rem",
                  backgroundColor: "white",
                }}
              >
                <b>댓글</b>
                <GalleryComment id={readid} />
              </ImgArea>
            )}
          </FullScreen>
          <div style={{ display: "none" }}>
            {gallListJson.map((val, i) => {
              let path = `${CDNURL}/data/${readid}/${val.name}`;
              if (isMobile && imgQuality) {
                let name = val.name.replace(/\.[^/.]+$/, "");
                path = `${CDNURL}/data_r/${readid}/${name}.jpg`;
              }
              let src =
                imgLoaded[i] === true || currentLoadImg === i ? path : null;
              return (
                <img
                  key={i}
                  alt={`${i}번째 이미지`}
                  src={src}
                  onLoad={() => currentLoadImg === i && onLoadImage(i)}
                  onError={() => onLoadError(i)}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

const ImgArea = styled.div`
  justify-content: center;
  text-align: center;
  background-color: lightgray;

  ${(props) => {
    if (props.fit === "width") {
      if (props.spread === true) {
        return css`
          & img {
            width: 50%;
            height: auto;
          }
        `;
      } else {
        return css`
          & img {
            width: 100%;
          }
        `;
      }
    } else if (props.fit === "height") {
      if (props.spread === true) {
        return css`
          & img {
            max-width: 50%;
            max-height: 100vh;
          }
        `;
      } else {
        return css`
          & img {
            max-width: 100%;
            max-height: 100vh;
          }
        `;
      }
    }
    /*
    else if (props.fit === 'original') {
      return css `
        & img {
          width: 100%;
        }
      `
    }*/
  }}

  ${(props) => {
    if (props.viewMode === true) {
      return css`
        & img {
          margin-bottom: 20px;
        }
      `;
    } else {
      return css`
        height: 100vh;
      `;
    }
  }}
`;

export default Reader;
