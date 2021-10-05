import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getNotice } from "../../lib/Board";
import styled from "styled-components";

const NoticeBar = () => {
  const [info, setInfo] = useState();

  useEffect(() => {
    async function getNoti() {
      let result = await getNotice();
      if (result !== false) {
        setInfo(result);
      }
    }
    getNoti();
  }, []);

  if (typeof info === "undefined") {
    return null;
  } else {
    return (
      <Notice>
        <NavLink to={`/board/${info.id}`}>
          {" "}
          <span className="badge badge-secondary">공지</span> {info.title}
        </NavLink>
      </Notice>
    );
  }
};

const Notice = styled.div`
  padding-top: 0.2em;
  padding-left: 1em;
  height: 2em;
  background-color: #e6f1fa;
  overflow: hidden;
`;

export default NoticeBar;
