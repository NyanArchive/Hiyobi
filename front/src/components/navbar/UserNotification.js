import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "reactstrap";
import {
  getNotifications,
  isLogined,
  readNotification,
  readAllNotification,
} from "../../lib/User";
import styled from "styled-components";

const UserNotification = () => {
  const [unreadList, setUnreadList] = useState([]);
  let history = useHistory();

  useEffect(() => {
    getNoti();
  }, []);

  if (!isLogined()) {
    return null;
  }

  async function getNoti() {
    try {
      let list = await getNotifications();
      setUnreadList(list.filter((val) => val.isread === 0));
    } catch (e) {
      console.error(e);
    }
  }

  const onClickNoti = async (i) => {
    let result = await readNotification(unreadList[i].id);
    if (result !== true) {
      alert("에러발생");
    }

    history.push(unreadList[i].link);
  };

  const onClickAllNoti = async () => {
    if (!(await readAllNotification())) {
      alert("에러발생");
    }
    getNoti();
  };

  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret>
        <span className="oi oi-bell" />{" "}
        {unreadList.length !== 0 && (
          <Badge color="danger" pill>
            {unreadList.length}
          </Badge>
        )}
      </DropdownToggle>
      <DropdownMenu style={{ minWidth: "15rem" }} className="p-0" right>
        {unreadList.length !== 0 ? (
          <>
            {unreadList.map((val, i) => (
              <React.Fragment key={val.id}>
                <DropdownItem onClick={() => onClickNoti(i)} className="p-2">
                  <NotiTitle>{val.title}</NotiTitle>
                  <NotiContent>{val.content} </NotiContent>
                </DropdownItem>
                {i + 1 !== unreadList.length && (
                  <DropdownItem className="m-0" divider />
                )}
              </React.Fragment>
            ))}
            <DropdownItem className="m-0" divider />
            <DropdownItem onClick={onClickAllNoti} className="p-2">
              <NotiTitle style={{ textAlign: "center" }}>
                알람 모두 읽음 처리
              </NotiTitle>
            </DropdownItem>
          </>
        ) : (
          <DropdownItem className="p-2 text-center">알람 없음</DropdownItem>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

const NotiTitle = styled.p`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 7px;
`;

const NotiContent = styled.p`
  font-size: 12px;
  white-space: pre-line;
  margin: 0;
`;

export default UserNotification;
