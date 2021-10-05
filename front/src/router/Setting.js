import React, { useState } from "react";
import { unRegister, isLogined, changePassword } from "../lib/User";
import { Container, InputGroup, Input, Button, ButtonGroup } from "reactstrap";
import SearchAuto from "../components/SearchAutoComplete";
import Navbar from "../components/navbar/Navbar";
import {
  setGalleryBlock,
  getGalleryBlock,
  getGalleryBlockType,
  setGalleryBlockType,
} from "../lib/Setting";

const Setting = () => {
  document.title = "설정 - hiyobi.me";

  let defaultTag = getGalleryBlock();
  if (typeof defaultTag !== "undefined") {
    let split = defaultTag.split("|");
    defaultTag = split;
  }

  const [blockType, setBlockType] = useState(getGalleryBlockType());

  const setBlockTags = (e) => {
    setGalleryBlock(e.join("|"));
  };

  const onClickPassword = async () => {
    if (!window.confirm("비밀번호를 변경하시겠습니까?")) {
      return;
    }

    let pass = document.getElementById("passch").value;
    let passcnf = document.getElementById("passch_confirm").value;

    if (pass === "") {
      alert("비밀번호를 입력해주세요");
      return;
    }

    if (pass !== passcnf) {
      alert("중복확인이 다릅니다.");
      return;
    }

    let result = await changePassword(pass);

    if (result.result === "ok") {
      alert("변경완료");
      window.location.href = "/";
    } else {
      alert("오류발생 : " + result.errorMsg);
    }
  };
  const unregister = async () => {
    if (
      window.prompt('회원탈퇴를 진행하시려면 "탈퇴"를 입력해주세요') === "탈퇴"
    ) {
      let result = await unRegister();

      if (result.result === "ok") {
        alert("변경완료");
        window.location.href = "/";
      } else {
        alert("오류발생 : " + result.errorMsg);
      }
    }
  };

  const onClickBlockType = async (type) => {
    setGalleryBlockType(type);
    setBlockType(type);
  };

  return (
    <>
      <Navbar />
      <Container>
        <h1 className="mb-5">설정페이지</h1>
        <h2>차단 목록</h2>
        <b>
          작가, 그룹, 태그만 차단 가능합니다.
          <br />
          차단목록은 브라우저에 저장되므로 기기별로 설정을 해줘야합니다.
          (시크릿모드일경우 접속시마다 풀림)
        </b>
        <br />
        <SearchAuto value={defaultTag} onChange={setBlockTags} />
        차단 방식 :{" "}
        <ButtonGroup>
          <Button
            color={blockType === "blur" ? "success" : "secondary"}
            onClick={() => onClickBlockType("blur")}
          >
            블러처리
          </Button>
          <Button
            color={blockType === "delete" ? "success" : "secondary"}
            onClick={() => onClickBlockType("delete")}
          >
            표시안함
          </Button>
        </ButtonGroup>
        <br />
        <br />
        <br />
        {isLogined() && (
          <>
            <InputGroup className="mb-5">
              <Input
                type="password"
                id="passch"
                placeholder="새 비밀번호 입력"
              />
              <Input
                type="password"
                id="passch_confirm"
                placeholder="중복확인"
              />
              <Button onClick={onClickPassword}>비밀번호 변경</Button>
            </InputGroup>
            <Button onClick={unregister} color="danger">
              회원탈퇴
            </Button>
          </>
        )}
      </Container>
    </>
  );
};

export default Setting;
