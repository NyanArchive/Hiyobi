import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import GalleryTag from "./GalleryTag";
import Cookie from "js-cookie";
import { GetGalleryListJson } from "../../lib/Gallery";
import Skeleton from "react-loading-skeleton";
import { getGalleryBlock, getGalleryBlockType } from "../../lib/Setting";
import { Tooltip, UncontrolledTooltip } from "reactstrap";
import GalleryComment from "./GalleryComment";
import GalleryDownloader from "./GalleryDownloader";
import { CDNURL } from "../../lib/Constants";

const GalleryBlock = (props) => {
  let data = props.data;

  const [page, setPage] = useState(props.dummy ? "???page" : "...");
  const [isCommentOpen, setCommentOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  let isBlur = "";
  let blocked = getGalleryBlock();

  useEffect(() => {
    async function getPage() {
      try {
        let tjson = await GetGalleryListJson(data.id);
        setPage(tjson.length + "P");
      } catch (e) {
        setPage("err");
      }
    }
    if (!props.dummy) {
      getPage();
    }
  }, [data, props.dummy]);

  if (typeof data !== "undefined") {
    let artists = props.data.artists.map((val) => {
      return { value: "artist:" + val.value };
    });
    let groups = props.data.groups.map((val) => {
      return { value: "group:" + val.value };
    });
    let blocktmp = [...props.data.tags, ...artists, ...groups];
    for (let i in blocktmp) {
      let tag = blocktmp[i];

      if (Cookie.get("blblur") === "true") {
        if (tag.value === "male:yaoi" || tag.value === "male:males only") {
          isBlur = " censoredImage";
        }
      }
      if (typeof blocked !== "undefined") {
        let block = blocked.split("|");
        for (let j in block) {
          if (
            tag.value === block[j].replace(/_/gi, " ") ||
            tag.display === block[j].replace(/_/gi, " ")
          ) {
            if (getGalleryBlockType() === "delete") {
              return null;
            } else {
              isBlur = " censoredImage";
            }
          }
        }
      }
    }
  }

  if (typeof data === "undefined") {
    return (
      <GalleryContent className="row" style={props.style}>
        <a
          className={
            "col-sm-12 col-md-3 mb-3 px-md-2 px-0 text-center backgrey" + isBlur
          }
        >
          <Skeleton height={300} />
        </a>
        <div className="col-sm-12 col-md-9 p-1 pl-md-4">
          <Title target="_blank">
            <Skeleton height={45} />
          </Title>

          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td>
                  <Skeleton />
                </td>
                <td>
                  <Skeleton />
                </td>
              </tr>
              <tr>
                <td>
                  <Skeleton />
                </td>
                <td>
                  <Skeleton />
                </td>
              </tr>
              <tr>
                <td>
                  <Skeleton />
                </td>
                <td>
                  <Skeleton />
                </td>
              </tr>
              <tr>
                <td>
                  <Skeleton />
                </td>
                <td>
                  <Skeleton />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GalleryContent>
    );
  } else {
    return (
      <GalleryContent className="row" style={props.style} id={props.id}>
        <a
          className={
            "col-sm-12 col-md-3 mb-3 mb-md-0 px-md-2 px-0 text-center backgrey" +
            isBlur
          }
          target="_blank"
          href={`/reader/${data.id}`}
        >
          <PageCountArea>{page}</PageCountArea>
          <img
            className="galleryimg"
            alt="갤러리 썸네일"
            src={
              props.thumbnail
                ? `data:image/png;base64, ${props.thumbnail}`
                : `${CDNURL}/tn/${data.id}.jpg`
            }
          />
        </a>
        <div
          className="col-sm-12 col-md-9 p-1 pl-md-4 d-flex"
          style={{ justifyContent: "space-between", flexFlow: "column" }}
        >
          <div></div>
          <div>
            <Title target="_blank" href={`/reader/${data.id}`}>
              {data.title}
            </Title>

            <table>
              <tbody>
                {(data.artists.length !== 0 || data.groups.length !== 0) && (
                  <tr className="infotr">
                    <td>작가 : </td>
                    <td>
                      {data.artists.length !== 0 &&
                        data.artists.map((val, i) => (
                          <a
                            key={i}
                            target="_blank"
                            href={`/search/artist:${val.value}`}
                          >
                            {val.display}
                            {data.artists.length !== i + 1 && <>{`, `}</>}
                          </a>
                        ))}
                      {data.groups.length !== 0 && (
                        <>
                          {` (`}
                          {data.groups.map((val, i) => (
                            <a
                              key={i}
                              target="_blank"
                              href={`/search/group:${val.value}`}
                            >
                              {val.display}
                              {data.groups.length !== i + 1 && <>{`, `}</>}
                            </a>
                          ))}
                          {`)`}
                        </>
                      )}
                    </td>
                  </tr>
                )}

                {data.characters.length !== 0 && (
                  <tr className="infotr">
                    <td>캐릭 : </td>
                    <td>
                      {data.characters.map((val, i) => (
                        <a
                          key={i}
                          data-original={val.value}
                          target="_blank"
                          href={`/search/character:${val.value}`}
                        >
                          {val.display}
                          {data.characters.length !== i + 1 && <>{`, `}</>}
                        </a>
                      ))}
                    </td>
                  </tr>
                )}

                {data.parodys.length !== 0 && (
                  <tr className="infotr">
                    <td>원작 : </td>
                    <td>
                      {data.parodys.map((val, i) => (
                        <a
                          key={i}
                          data-original={val.value}
                          target="_blank"
                          href={`/search/series:${val.value}`}
                        >
                          {val.display}
                          {data.parodys.length !== i + 1 && <>{`, `}</>}
                        </a>
                      ))}
                    </td>
                  </tr>
                )}

                <tr className="infotr">
                  <td>종류 : </td>
                  <td>
                    <a
                      target="_blank"
                      href={`/search/type:${typeToStr(data.type)}`}
                    >
                      {typeToDisplay(data.type)}
                    </a>
                  </td>
                </tr>

                <tr>
                  <td>태그 : </td>
                  <td style={{ lineHeight: 1.7 }}>
                    {data.tags.map((val, i) => (
                      <GalleryTag
                        key={i}
                        value={val.value}
                        display={val.display}
                      />
                    ))}
                  </td>
                </tr>

                {data.uploader !== 0 && (
                  <tr>
                    <td style={{ width: "4rem" }}>업로더 : </td>
                    <td>{data.uploadername}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <ButtonArea>
            <GalleryBtn onClick={() => setDownloadOpen(true)}>
              <span className="oi oi-data-transfer-download" />
            </GalleryBtn>
            {downloadOpen && (
              <GalleryDownloader
                info={data}
                onClickClose={() => setDownloadOpen(false)}
              />
            )}
          </ButtonArea>
        </div>
        <div
          style={{
            width: "100%",
            borderTop: isCommentOpen && "1px black solid",
            padding: isCommentOpen && 5,
          }}
        >
          {isCommentOpen === true && <GalleryComment id={data.id} />}
        </div>
      </GalleryContent>
    );
  }
};

GalleryBlock.defaultProps = {
  title: "",
  artists: [],
  parodys: [],
  type: "",
  tag: [],
};

const GalleryContent = styled.div`
  /*width: 100%;*/
  display: flex;
  border: 0.0625rem rgba(0, 0, 0, 0.16) solid;
  box-shadow: 0 0.1875rem 0.1875rem 0 rgba(0, 0, 0, 0.16),
    0 0 0 0.0625rem rgba(0, 0, 0, 0.08);
  border-radius: 0.1875rem;
  padding: 0.3125rem;
  background: #fff;
  align-items: stretch;
  margin-bottom: 1.5rem;
  /*line-height: 1.5;*/

  & .galleryimg {
    max-width: 100%;
    max-height: 300px;
  }

  & .censoredImage {
    filter: blur(5px);
  }
  & .censoredImage:hover {
    filter: blur(0);
  }

  & > .backgrey {
    background-color: #eee;
  }

  & table {
    margin-top: 10px;
  }

  & table > tbody > tr > td:first-child {
    width: 3rem;
    padding-right: 0.3125rem;
    vertical-align: top;
  }

  & .infotr a:link,
  & .infotr a:visited {
    color: black;
  }

  & .infotr a:link:hover {
    color: #0056b3;
    text-decoration: none;
  }
`;

const Title = styled.a`
  color: black;
  font-weight: bolder;
  font-size: 1.25rem;
  line-height: 1;
  word-wrap: break-all;

  &:link,
  &:visited {
    color: black;
  }

  &:hover {
    color: #0056b3;
    text-decoration: none;
  }
`;

const PageCountArea = styled.pre`
  position: absolute;
  padding: 0px 5px;
  height: 20px;
  font-size: 14px;
  right: 0;
  text-align: right;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
`;

const ButtonArea = styled.div`
  display: flex;
  width: 100%;
  height: 40px;
  //border-top: 1px rgba(0,0,0,0.3) solid;
`;

const GalleryBtn = styled.div`
  display: flex;
  flex: 1;
  color: grey;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: black;
  }
`;

const typeToDisplay = (type) => {
  switch (type) {
    case 1:
      return "동인지";
    case 2:
      return "망가";
    case 3:
      return "Cg아트";
    case 4:
      return "게임Cg";
    default:
      return "";
  }
};
const typeToStr = (type) => {
  switch (type) {
    case 1:
      return "doujinshi";
    case 2:
      return "manga";
    case 3:
      return "artistcg";
    case 4:
      return "gamecg";
    default:
      return "";
  }
};

export default GalleryBlock;
