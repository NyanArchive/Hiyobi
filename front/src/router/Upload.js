import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar/Navbar";
import SearchBar from "../components/SearchBar";
import { NavLink, useHistory } from "react-router-dom";
import { APIURL } from "../lib/Constants";
import TagInput from "../components/TagInput";
import { getAutoComplete } from "../lib/AutoComplete";
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Progress,
  Container,
} from "reactstrap";
import jszip from "jszip";
import { orderBy } from "natural-orderby";
import GalleryBlock from "../components/gallery/GalleryBlock";
import { isLogined, getUserId, getUserName, getUserToken } from "../lib/User";

const Upload = () => {
  let history = useHistory();
  if (!isLogined()) {
    alert("로그인이 필요합니다.");
    history.goBack();
  }

  const [auto, setAuto] = useState();
  const [artists, setArtists] = useState([]);
  const [groups, setGroups] = useState([]);
  const [parodys, setParodys] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [tags, setTags] = useState([]);
  const [, forceUpdate] = React.useState(0);
  const [thumbnail, setThumbnail] = useState("");

  const [uploadWarning, setUploadWarning] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const [entry, setEntry] = useState();

  let file = useRef();

  useEffect(() => {
    async function getAuto() {
      let auto = await getAutoComplete();
      setAuto(auto);
    }
    getAuto();
  }, []);

  const onUpload = async (e) => {
    setUploadWarning(false);
    let zipfile = file.current.files[0];
    let json = {
      title: document.getElementById("title").value,
      comment: document.getElementById("comment").value,
      type: Number(document.getElementById("type").value),
      artists: artists,
      groups: groups,
      parodys: parodys,
      characters: characters,
      tags: tags,
    };

    let xhr = new XMLHttpRequest();
    let formdata = new FormData();

    formdata.append("zipfile", zipfile);
    formdata.append("info", JSON.stringify(json));

    xhr.open("POST", APIURL + "/gallery/upload", true);
    xhr.setRequestHeader("Authorization", "Bearer " + getUserToken());

    xhr.addEventListener(
      "loadstart",
      (e) => {
        setIsUploading(true);
      },
      false
    );

    xhr.addEventListener(
      "progress",
      (e) => {
        var percent = 0;
        var position = e.loaded;
        var total = e.total;
        if (e.lengthComputable) {
          percent = Math.ceil((position / total) * 100);
        }
        setUploadPercent(percent);
      },
      false
    );

    xhr.onreadystatechange = () => {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200 || xhr.status === 201) {
          let resp = JSON.parse(xhr.responseText);
          if (resp.errorMsg) {
            alert(resp.errorMsg);
            setIsUploading(false);
          } else if (resp.status === "success") {
            alert("업로드 요청완료. 처리까지 시간이 걸릴 수 있습니다.");
            window.location.reload();
          }
        } else {
          alert("에러발생 : " + xhr.response);
          setIsUploading(false);
        }
      }
    };
    xhr.send(formdata);
  };

  const onChangeFile = async (e) => {
    let zipfile = file.current.files[0];
    let zip = await jszip().loadAsync(zipfile);
    let entry = [];

    zip.forEach((relativePath, zipEntry) => {
      entry.push(zipEntry.name);
    });

    entry = orderBy(entry);
    setEntry(entry.join("\n"));

    let tn = await zip.file(entry[0]).async("base64");
    setThumbnail(tn);
  };

  if (typeof auto === "undefined") {
    return "로드중...";
  } else {
    let a_artists = auto
      .filter((val) => val.startsWith("artist:") || val.startsWith("작가:"))
      .map((val) => {
        return val.replace("artist:", "").replace("작가:", "");
      });

    let a_groups = auto
      .filter((val) => val.startsWith("group:") || val.startsWith("그룹:"))
      .map((val) => {
        return val.replace("group:", "").replace("그룹:", "");
      });

    let a_parodys = auto
      .filter((val) => val.startsWith("series:") || val.startsWith("원작:"))
      .map((val) => {
        return val.replace("series:", "").replace("원작:", "");
      });

    let a_characters = auto
      .filter((val) => val.startsWith("character:") || val.startsWith("캐릭:"))
      .map((val) => {
        return val.replace("character:", "").replace("캐릭:", "");
      });

    let a_tags = auto
      .filter(
        (val) =>
          val.startsWith("tag:") ||
          val.startsWith("female:") ||
          val.startsWith("male:") ||
          val.startsWith("태그:") ||
          val.startsWith("여:") ||
          val.startsWith("남:")
      )
      .map((val) => {
        return val.replace("tag:", "").replace("태그:", "");
      });

    return (
      <>
        <Navbar />
        <Container>
          <h2>업로드</h2>
          <small>
            업로드 관리 페이지는 추후 추가될 예정입니다.{" "}
            <NavLink to="/mypage">임시관리페이지</NavLink>
          </small>
          <hr />
          <Input
            type="text"
            id="title"
            onChange={() => forceUpdate((v) => !v)}
            placeholder="제목"
          />
          종류 :{" "}
          <select
            onChange={() => forceUpdate((v) => !v)}
            defaultValue={1}
            id="type"
          >
            <option value={1}>동인지</option>
            <option value={2}>망가</option>
            <option value={3}>아트Cg</option>
            <option value={4}>게임Cg</option>
          </select>
          <br />
          <br />
          <br />
          코멘트 :
          <textarea style={{ width: "100%" }} id="comment" />
          <br />
          <br />
          <b>
            태그 테러를 방지하기 위해 현재 등록되어있는 태그만 입력할 수 있도록
            변경되었습니다.
            <br />
            자동완성을 참고하여 등록하여 주시기 바랍니다.
          </b>
          <TagInput
            autoComplete={a_artists}
            placeholder="작가"
            value={artists}
            onChange={(e) => setArtists(e)}
            settings={{ enforceWhitelist: true }}
          />
          <TagInput
            autoComplete={a_groups}
            placeholder="그룹"
            value={groups}
            onChange={(e) => setGroups(e)}
            settings={{ enforceWhitelist: true }}
          />
          <TagInput
            autoComplete={a_parodys}
            placeholder="원작"
            value={parodys}
            onChange={(e) => setParodys(e)}
            settings={{ enforceWhitelist: true }}
          />
          <TagInput
            autoComplete={a_characters}
            placeholder="캐릭터"
            value={characters}
            onChange={(e) => setCharacters(e)}
            settings={{ enforceWhitelist: true }}
          />
          <TagInput
            autoComplete={a_tags}
            placeholder="태그"
            value={tags}
            onChange={(e) => setTags(e)}
            settings={{ enforceWhitelist: true }}
          />
          <br />
          <br />
          <b>
            zip파일만 업로드 할 수 있습니다.
            <br />
            압축파일내 폴더가 있으면 안되고 바로 이미지 파일만 있어야
            정상처리됩니다. <br />
          </b>
          <input
            type="file"
            onChange={onChangeFile}
            ref={file}
            name="zipfile"
            accept=".zip"
          />
          <br />
          <br />
          <br />
          이미지순서
          <br />
          <textarea
            style={{ width: "100%" }}
            rows={10}
            readOnly
            value={entry}
          />
          <br />
          미리보기
          <br />
          <GalleryBlock
            thumbnail={thumbnail}
            dummy
            data={{
              title:
                document.getElementById("title") &&
                document.getElementById("title").value,
              artists: artists.map((val) => {
                return { display: val, value: val };
              }),
              groups: groups.map((val) => {
                return { display: val, value: val };
              }),
              characters: characters.map((val) => {
                return { display: val, value: val };
              }),
              parodys: parodys.map((val) => {
                return { display: val, value: val };
              }),
              tags: tags.map((val) => {
                return { display: val, value: val };
              }),
              type:
                document.getElementById("type") &&
                Number(document.getElementById("type").value),
              uploader: getUserId(),
              uploadername: getUserName(),
            }}
          />
          <Button onClick={() => setUploadWarning(true)}>업로드</Button>
          <Modal isOpen={uploadWarning} backdrop={"static"} keyboard={false}>
            <ModalHeader>업로드 경고</ModalHeader>
            <ModalBody>
              <div>
                <ul>
                  <li>장난성 업로드</li>
                  <li>BL 작품 태그 누락</li>
                </ul>
                등의 정상적이지 않은 작품 업로드시
                <br />
                <span style={{ fontWeight: "bold", color: "red" }}>
                  경고없이 즉시 계정정지됩니다.
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <Button color="danger" onClick={() => setUploadWarning(false)}>
                  취소
                </Button>
                <Button color="success" onClick={onUpload}>
                  업로드
                </Button>
              </div>
            </ModalBody>
          </Modal>
          <Modal isOpen={isUploading} backdrop={"static"} keyboard={false}>
            <ModalHeader>업로드중...</ModalHeader>
            <ModalBody>
              <Progress animated value={uploadPercent} />
              <small>완료되기전 브라우저를 종료하지 마세요.</small>
            </ModalBody>
          </Modal>
        </Container>
      </>
    );
  }
};

export default Upload;
