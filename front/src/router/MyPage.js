import React, { useEffect, useState } from "react";
import { unRegister, isLogined, changePassword } from "../lib/User";
import Navbar from "../components/navbar/Navbar";
import { Container } from "reactstrap";
import { apifetch } from "../lib/Fetch";
import moment from "moment";

const MyPage = () => {
  const [list, setList] = useState();

  useEffect(() => {
    async function getList() {
      let result = await apifetch({ url: "/user/getuploads", method: "get" });
      setList(result);
    }

    if (typeof list === "undefined") {
      getList();
    }
  }, [list]);

  return (
    <>
      <Navbar />
      <Container>
        <b>업로드 관리(임시)</b>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>id</th>
              <th>제목</th>
              <th>업로드 상태</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {list ? (
              list.map((val) => (
                <tr>
                  <td>{val.id}</td>
                  <td>{val.title}</td>
                  <td>
                    {getStatusText(val.uploadStatus)}{" "}
                    {val.errorMsg && `(${val.errorMsg})`}
                  </td>
                  <td>{moment.unix(val.date).format("YY/MM/DD HH:mm:ss")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>로드중...</td>
              </tr>
            )}
          </tbody>
        </table>
      </Container>
    </>
  );
};

function getStatusText(status) {
  switch (status) {
    case "waiting":
      return "처리 대기중";
    case "running":
      return "처리중";
    case "completed":
      return "처리 완료";
    case "errored":
      return "처리 에러";
    default:
      return "err";
  }
}

export default MyPage;
