import React, { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import { useHistory } from "react-router-dom";
import { Container, Row, Col, Form, Input, Button } from "reactstrap";
import { Write } from "../lib/Board";
import { isLogined } from "../lib/User";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { apifilefetch, apifetch } from "../lib/Fetch";
import { USERIMGURL } from "../lib/Constants";
import { useRef } from "react";
import { useEffect } from "react";

const BoardWrite = () => {
  const [images, setImages] = useState([]);
  const [isImageUploading, setImageUploading] = useState(false);
  const [categorylist, setCategory] = useState([]);
  const [isPostUploading, setPostUploading] = useState(false);

  let Quill = useRef();
  let history = useHistory();

  if (!isLogined()) {
    alert("로그인이 필요합니다.");
    history.goBack();
  }

  useEffect(() => {
    async function getCategory() {
      try {
        let list = await apifetch({
          url: "/board/categorylist",
          method: "get",
        });

        setCategory(list.filter((val) => val.iswriteable === 1));
      } catch (e) {
        alert("에러 발생 : " + e);
      }
    }

    if (categorylist.length === 0) {
      getCategory();
    }
  }, [categorylist.length]);

  const imageHandler = async (e) => {
    let QuillEl = Quill.current.getEditor();

    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", ".jpeg, .jpg, .png, .gif");
    input.setAttribute("multiple", "true");

    input.click();

    input.onchange = async () => {
      let formData = new FormData();

      for (const file of input.files) {
        formData.append("files", file, file.name);
      }

      // Save current cursor state
      const range = QuillEl.getSelection(true);

      try {
        setImageUploading(true);
        const res = await apifilefetch({
          url: "/board/uploadimage",
          method: "POST",
          data: formData,
        });
        setImages([...images, ...res]);

        QuillEl = Quill.current.getEditor();
        // Insert uploaded image
        for (let i in res) {
          let img = res[i];
          let path =
            img.imagepath.slice(0, 1) + "/" + img.imagepath.slice(1, 3) + "/";
          QuillEl.insertEmbed(
            range.index + Number(i),
            "image",
            USERIMGURL + "/img/board/" + path + img.imagepath
          );
        }

        setImageUploading(false);
      } catch (e) {
        console.error(e);
        setImageUploading(false);
        alert("이미지 업로드 오류 발생");
      }
    };
  };

  const submitWrite = async (e) => {
    try {
      setPostUploading(true);
      let QuillEl = Quill.current.getEditor();

      let category = document.getElementById("category").value;
      let title = document.getElementById("title").value;
      let body = QuillEl.root.innerHTML;
      category = Number(category);

      let result = await Write({
        title: title,
        category: category,
        content: body,
        images: images.map((val) => val.id),
      });

      if (result.errorMsg) {
        alert(result.errorMsg);
        setPostUploading(false);
        return;
      }

      setPostUploading(false);
      history.push("/board/" + result);
      return false;
    } catch (e) {
      setPostUploading(false);
      alert("에러발생" + e);
    }
  };

  document.title = "글쓰기 - hiyobi.me";

  return (
    <>
      <Navbar />
      <Container>
        <Form>
          <Row form>
            <Col sm={3} className="my-1">
              <Input id="category" type="select" name="category">
                {categorylist.map((val) => (
                  <option value={val.id}>{val.name}</option>
                ))}
              </Input>
            </Col>
            <Col sm={9} className="my-1">
              <Input
                id="title"
                type="text"
                required
                placeholder="제목 입력..."
              />
            </Col>
            <Col className="my-1">
              <ReactQuill
                ref={Quill}
                id="content"
                style={{ height: 600, marginBottom: 50 }}
                modules={{
                  toolbar: {
                    container: [
                      ["bold", "italic", "underline", "strike"],
                      ["link", "image", "video"],
                      ["clean"],
                    ],
                    handlers: {
                      image: imageHandler,
                    },
                  },
                }}
              />

              {/*<textarea id='content' required className='form-control my-1' style={{ width: '100%', height: 400 }} /> */}
            </Col>
          </Row>
        </Form>
        <Button
          onClick={submitWrite}
          type="submit"
          outline
          color="dark"
          disabled={isPostUploading}
        >
          <span className="oi oi-pencil" /> 글쓰기
        </Button>
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: isImageUploading ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <b>이미지 업로드중...</b>
        </div>
      </Container>
    </>
  );
};

export default BoardWrite;
