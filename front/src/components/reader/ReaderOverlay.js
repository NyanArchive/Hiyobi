import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Cookie from "js-cookie";
import { isMobile, MobileView } from "react-device-detect";
import { isLogined, setBookmark } from "../../lib/User";
import {
  DropdownItem,
  Dropdown,
  DropdownMenu,
  UncontrolledDropdown,
  DropdownToggle,
  Input,
  FormGroup,
  Form,
} from "reactstrap";
import ModalPortal from "../modal/ModalPortal";
import Login from "../modal/Login";

const ReaderOverlay = (props) => {
  const {
    info,
    onClickImageQuality,
    onClickViewMode,
    onClickSpread,
    onClickImgFit,
    onChangeOpen,
    onChangeSelectedImg,
    onClickFull,
  } = props;

  const [selectedImg, setSelectedImg] = useState(props.selectedImg);
  const [isOverlayOpen, setOverlayOpen] = useState(props.isOpen ? true : false);
  const [imgQuality, setImgQuality] = useState(props.imgQuality);
  const [imgFit, setImgFit] = useState(props.imgFit);
  const [spread, setSpread] = useState(props.spread);
  const [viewMode, setViewMode] = useState(props.viewMode);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const toggleOverlay = () => {
    onChangeOpen(!isOverlayOpen);
    setOverlayOpen((prev) => !prev);
  };

  const onClickBookmark = () => {
    if (!isLogined()) {
      alert("로그인이 필요합니다.");
      setLoginOpen(true);
      return;
    }

    setBookmark({ galleryid: info.id });
  };

  let pageoption = props.list.map((val, i) => (
    <option key={i} value={i}>
      {i + 1}
    </option>
  ));

  useEffect(() => {
    if (isOverlayOpen !== props.isOpen) {
      setOverlayOpen(props.isOpen);
    }
    if (imgFit !== props.imgFit) {
      setImgFit(props.imgFit);
    }
    if (imgQuality !== props.imgQuality) {
      setImgQuality(props.imgQuality);
    }
    if (spread !== props.spread) {
      setSpread(props.spread);
    }
    if (viewMode !== props.viewMode) {
      setViewMode(props.viewMode);
    }
    if (selectedImg !== props.selectedImg) {
      setSelectedImg(props.selectedImg);
    }
  }, [
    props.isOpen,
    props.imgFit,
    props.imgQuality,
    props.spread,
    props.viewMode,
    props.selectedImg,
    isOverlayOpen,
    imgFit,
    imgQuality,
    spread,
    viewMode,
    selectedImg,
  ]);

  return (
    <>
      <HeadStyle style={{ display: isOverlayOpen ? null : "none" }}>
        <div style={{ display: "flex" }}>
          <IconBtn href={"/info/" + info.id} target="_blank">
            <span className="oi oi-info" />
          </IconBtn>
        </div>
        <Title>{info.title}</Title>
        <div style={{ display: "flex" }}>
          <IconBtn onClick={onClickFull}>
            <span className="oi oi-fullscreen-enter" />
          </IconBtn>
          <IconBtn onClick={onClickBookmark} target="_blank">
            <span className="oi oi-bookmark" />
          </IconBtn>
        </div>
      </HeadStyle>
      <OverlayBody
        style={{ display: isOverlayOpen ? null : "none" }}
        onClick={toggleOverlay}
      />
      <FootStyle style={{ display: isOverlayOpen ? null : "none" }}>
        <div style={{ marginLeft: 10, display: "flex" }}>
          {!viewMode && (
            <>
              <Form inline>
                <select
                  value={selectedImg}
                  onChange={(e) => onChangeSelectedImg(Number(e.target.value))}
                >
                  {pageoption}
                </select>
                &nbsp;/&nbsp;{props.list.length}
              </Form>
              <IconBtn onClick={() => onChangeSelectedImg(selectedImg - 1)}>
                <span className="oi oi-caret-left" />
              </IconBtn>
              <IconBtn onClick={() => onChangeSelectedImg(selectedImg + 1)}>
                <span className="oi oi-caret-right" />
              </IconBtn>
            </>
          )}
        </div>
        <div style={{ display: "flex" }}>
          <IconBtn style={{ fontSize: 12 }} onClick={onClickViewMode}>
            {viewMode ? "스크롤" : "페이지"}
          </IconBtn>
          <IconBtn style={{ fontSize: 12 }} onClick={onClickSpread}>
            {spread ? "2장" : "1장"}
          </IconBtn>
          <IconBtn onClick={onClickImgFit}>
            {imgFit === "width" && <span className={`oi oi-resize-width`} />}
            {imgFit === "height" && <span className={`oi oi-resize-height`} />}
            {imgFit === "original" && <span className={`oi oi-resize-both`} />}
          </IconBtn>
          <MobileView>
            <UncontrolledDropdown>
              <DropdownToggle
                tag="p"
                style={{
                  color: "black",
                  width: 45,
                  height: 45,
                  margin: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span className="oi oi-aperture" />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={onClickImageQuality}>
                  절약 화질 {imgQuality && <span className="oi oi-check" />}
                </DropdownItem>
                <DropdownItem onClick={onClickImageQuality}>
                  원본 화질 {!imgQuality && <span className="oi oi-check" />}
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </MobileView>
        </div>
      </FootStyle>
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

const HeadStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  height: 45px;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);
`;

const OverlayBody = styled.div`
  width: 100%;
  height: 100%;
  /*position: absolute;*/
  top: 0;
  left: 0;
`;

const FootStyle = styled.div`
  display: flex;
  position: fixed;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 45px;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);
`;

const Title = styled.span`
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  flex: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconBtn = styled.a`
  display: flex;
  width: 45px;
  height: 45px;
  justify-content: center;
  align-items: center;
  color: black;

  font-size: 100%;
  font-family: inherit;
  border: 0;
  padding: 0;
  background-color: unset;

  &:hover {
    text-decoration: none;
    color: black;
    cursor: pointer;
  }
`;

export default ReaderOverlay;
