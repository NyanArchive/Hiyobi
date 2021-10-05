import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import moment from "moment";

const activeClassName = "board-sm-category";

const BoardListMobile = (props) => {
  let data = props.data;
  return (
    <List>
      <NavLink to={`/board/${data.id}/?p=${props.paging}`}>
        <MobileList>
          <span className="title">
            <CategoryTag
              to={`/board?c=${data.category}`}
              activeClassName={activeClassName}
            >
              {data.categoryname}
            </CategoryTag>
            {data.imgcount > 0 && (
              <img
                style={{ width: 15, height: 15, marginRight: 5 }}
                src="/picture_icon.png"
                alt="img"
              />
            )}
            {data.title}
          </span>
          <div className="info">
            <span className="writer">{data.name}</span>
            <Divider>|</Divider>
            <span className="date">
              {!moment(data.date * 1000).isBefore(moment(), "day")
                ? moment(data.date * 1000).format("HH:mm")
                : moment(data.date * 1000).format("MM/DD")}
            </span>
            <Divider>|</Divider>
            <span className="count">조회 {data.cnt}</span>
          </div>
        </MobileList>
        <div className="commentcnt">{data.cmtcnt}</div>
      </NavLink>
    </List>
  );
};

const List = styled.li`
  list-style: none;
  margin: 0;
  border-top: 1px #dfe1ee solid;

  & > a {
    padding: 5px 12px;
    display: flex;
    justify-content: space-between;
  }

  & > a:visited .title {
    color: #6d459e;
  }

  & > a > .commentcnt {
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #d22227;
    font-weight: bold;
    flex-shrink: 0;
  }

  &:last-of-type {
    border-bottom: 1px #def1ee solid;
  }
`;

const MobileList = styled.div`
  display: flex;
  height: 50px;
  flex-direction: column;
  justify-content: space-between;
  color: black;
  overflow: hidden;

  & .title {
    font-size: 16px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .info {
    font-size: 14px;
    color: #999;
  }
`;

const Divider = styled.span`
  margin-left: 5px;
  margin-right: 5px;
`;

const CategoryTag = styled(NavLink).attrs({
  activeClassName,
})`
  padding: 2px 12px;
  color: white;
  background-color: grey;
  text-align: center;
  margin-right: 7px;
  border-radius: 15px;
  font-size: 12px;

  &.${activeClassName} {
    color: white;
  }
  &.${activeClassName}:hover {
    text-decoration: none;
    color: white;
  }
`;

export default BoardListMobile;
